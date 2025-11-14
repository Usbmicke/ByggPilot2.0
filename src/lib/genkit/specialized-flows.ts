
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { googleAI, gemini15Pro } from '@genkit-ai/googleai'; // Uppdaterad modell
import { generate, defineTool } from '@genkit-ai/ai';
import { AtaCreationSchema, AtaIdSchema, ProjectIdSchema, QuoteCreationSchema } from '../schemas/schemas';
import { createAta, createQuote } from '../dal/dal';
import { FlowAuth } from '@genkit-ai/flow';
import { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow } from './brains';

// =================================================================================
// MODELLER
// =================================================================================

const heavyDuty = gemini15Pro; // Använder en kraftfullare modell för komplexa uppgifter
const vision = gemini15Pro;    // Samma modell kan hantera vision

// =================================================================================
// VERKTYG (TOOLS) FÖR FLÖDENA
// =================================================================================

// Ett verktyg för att faktiskt skapa offerten i databasen
const createQuoteDocumentTool = defineTool(
    { 
        name: 'createQuoteDocumentTool', 
        description: 'Skapar ett formellt offertdokument i databasen baserat på strukturerad information.',
        inputSchema: QuoteCreationSchema,
        outputSchema: z.string().describe('ID för den nyskapade offerten.')
    },
    async (quoteData, context) => {
        console.log("[Tool:createQuoteDocumentTool] Anropad med data:", quoteData);
        const auth = context?.auth as FlowAuth;
        if (!auth?.uid) throw new Error('Användarautentisering saknas.');
        
        // Anropar databasfunktionen för att skapa offerten
        const quoteId = await createQuote({ ...quoteData, createdBy: auth.uid });
        console.log("[Tool:createQuoteDocumentTool] Offert skapad med ID:", quoteId);
        return quoteId;
    }
);

// Ett verktyg som simulerar sparandet av en SIE-4 fil
const saveSie4FileToStorage = defineTool(
    { 
        name: 'saveSie4FileToStorage', 
        description: 'Sparar en genererad SIE-4-filsträng till molnlagringen och returnerar en säker nedladdningslänk.',
        inputSchema: z.object({ sieContent: z.string(), projectId: z.string() }),
        outputSchema: z.string().url() 
    },
    async ({ sieContent, projectId }) => {
        console.log(`[Tool:saveSie4FileToStorage] Simulerar sparande av SIE-fil för projekt ${projectId}`);
        // I en verklig applikation skulle vi här ladda upp `sieContent` till t.ex. Google Cloud Storage
        // och returnera en signerad URL för säker nedladdning.
        return `https://storage.googleapis.com/byggpilot-eko-export/simulated/${projectId}-report.se`;
    }
);

// =================================================================================
// FLÖDE 1: RÖST-TILL-ÄTA (audioToAtaFlow)
// =================================================================================

export const audioToAtaFlow = defineFlow(
    {
        name: 'audioToAtaFlow',
        inputSchema: z.object({ 
            audioUrl: z.string().url().describe('En URL till en ljudfil (t.ex. .mp3, .wav).'),
            projectId: ProjectIdSchema 
        }),
        outputSchema: z.object({ 
            ataId: AtaIdSchema, 
            message: z.string() 
        }),
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Autentisering krävs för detta flöde.');
        },
    },
    async ({ audioUrl, projectId }, context) => {
        console.log(`[Flow:audioToAtaFlow] Startar för projekt ${projectId} med ljudfil från ${audioUrl}`);
        const auth = context.auth as FlowAuth;
        if (!auth?.uid) throw new Error('Kunde inte verifiera användar-ID.');

        // Steg 1: Använd en multimodal modell för att transkribera och extrahera data
        const llmResponse = await generate({
            model: vision, // Vision-modellen kan hantera ljud
            prompt: `Du är en expert på att tolka arbetsorder inom byggbranschen. Lyssna på följande ljudinspelning och extrahera informationen för att skapa en ÄTA (Ändringar, Tillägg, Avgående arbeten). Svara ENBART med ett JSON-objekt som följer det specificerade schemat. Ljudfil att analysera: ${audioUrl}`,
            output: { schema: AtaCreationSchema, format: 'json' },
        });

        const extractedData = llmResponse.output();
        if (!extractedData) {
            throw new Error("Kunde inte extrahera ÄTA-information från ljudfilen.");
        }

        // Steg 2: Anropa databaslagret för att skapa ÄTA-posten
        const ataToCreate = { projectId, userId: auth.uid, ...extractedData };
        const newAtaId = await createAta(ataToCreate);
        
        console.log(`[Flow:audioToAtaFlow] Nytt ÄTA-objekt skapat med ID: ${newAtaId}`);
        return { ataId: newAtaId, message: "En ny ÄTA har skapats framgångsrikt från ljudfilen." };
    }
);

// =================================================================================
// FLÖDE 2: SPILL-ANALYS (analyzeSpillWasteFlow)
// =================================================================================

const cutPlanSchema = z.object({
  description: z.string().describe('En kort sammanfattning av den föreslagna kapningsplanen.'),
  estimatedSavings: z.number().describe('Uppskattad besparing i procent (t.ex. 15 för 15%).'),
  cuts: z.array(z.object({
    piece: z.string().describe('Beskrivning av biten som ska kapas, t.ex. \'Väggregel 45x70\'.'),
    length: z.number().describe('Längden i meter som ska kapas, t.ex. 1.2.'),
    from: z.string().describe('Identifierare för spillbiten den ska kapas från, t.ex. \'Spillbit A\'.')
  }))
});

export const analyzeSpillWasteFlow = defineFlow(
    {
        name: 'analyzeSpillWasteFlow',
        inputSchema: z.object({ 
            imageUrl: z.string().url().describe('URL till en bild som visar spillmaterialet.')
        }),
        outputSchema: cutPlanSchema,
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Autentisering krävs.');
        },
    },
    async ({ imageUrl }) => {
        console.log(`[Flow:analyzeSpillWasteFlow] Startar analys för bild från ${imageUrl}`);
        const llmResponse = await generate({
            model: vision,
            prompt: `Du är en expert på materialoptimering i byggbranschen. Analysera bilden på spillmaterialet. Identifiera de användbara bitarna och skapa en optimerad kapningsplan för att minimera framtida spill. Svara ENDAST med ett JSON-objekt som följer det specificerade schemat. Bild att analysera: ${imageUrl}`,
            output: { schema: cutPlanSchema, format: 'json' }
        });
        
        const plan = llmResponse.output();
        if (!plan) {
            throw new Error("Kunde inte generera en kapningsplan från den angivna bilden.");
        }

        console.log("[Flow:analyzeSpillWasteFlow] Genererad kapningsplan:", plan);
        return plan;
    }
);


// =================================================================================
// FLÖDE 3: OFFERT-GENERATOR (generateQuoteFlow)
// =================================================================================

export const generateQuoteFlow = defineFlow(
    {
        name: 'generateQuoteFlow',
        inputSchema: z.object({ 
            prompt: z.string().describe('En textbeskrivning av arbetet som ska offereras.'), 
            projectId: ProjectIdSchema 
        }),
        outputSchema: z.string().describe('ID för den nyskapade offerten.'),
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Autentisering krävs.');
        },
    },
    async ({ prompt, projectId }, context) => {
        console.log(`[Flow:generateQuoteFlow] Startar för projekt ${projectId} med prompt: \"${prompt}\"`);
        
        // Steg 1: Använd AI med RAG-verktyg för att samla in information och resonera.
        const llmResponse = await generate({
            model: heavyDuty,
            prompt: `Du är en avancerad AI-assistent som skapar offerter för ett byggföretag. Använd de tillgängliga verktygen för att samla information och skapa en komplett, strukturerad offert baserat på användarens prompt. Anropa sedan \'createQuoteDocumentTool\' med det slutgiltiga, kompletta offertobjektet.\n\nAnvändarens prompt: \"${prompt}\"\nProjekt-ID: ${projectId}`,
            tools: [
                createQuoteDocumentTool, // Verktyget som faktiskt skapar offerten
                // Verktyg som anropar andra Genkit-flöden för RAG
                defineTool({ name: 'askBranschensHjarna', description: 'Använd detta för att söka i branschens offentliga kunskapsdatabas om byggregler, standarder etc.', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askBranschensHjärnaFlow', { prompt })),
                defineTool({ name: 'askForetagetsHjarna', description: 'Använd detta för att söka i företagets privata databas om tidigare projekt, prissättning, material etc.', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askFöretagetsHjärnaFlow', { prompt }))
            ]
        });
        
        // Steg 2: Extrahera resultatet från det verktygsanrop som gjordes.
        const toolCall = llmResponse.toolCalls.find(tc => tc.tool === 'createQuoteDocumentTool');
        if (!toolCall || !toolCall.output) {
            throw new Error("Kunde inte anropa verktyget för att skapa offerten.");
        }
        
        const newQuoteId = toolCall.output as string;
        console.log(`[Flow:generateQuoteFlow] Flödet slutfört. Nytt offert-ID: ${newQuoteId}`);
        return newQuoteId;
    }
);


// =================================================================================
// FLÖDE 4: BOKFÖRINGS-EXPORT (generateSie4Flow)
// =================================================================================

export const generateSie4Flow = defineFlow(
    {
        name: 'generateSie4Flow',
        inputSchema: z.object({ 
            projectId: ProjectIdSchema,
        }),
        outputSchema: z.string().url().describe('En nedladdningslänk till den genererade SIE 4-filen.'),
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Autentisering krävs.');
        },
    },
    async ({ projectId }) => {
        console.log(`[Flow:generateSie4Flow] Startar SIE-4 export för projekt ${projectId}`);

        // Steg 1: (Simulerat) Hämta all nödvändig ekonomisk data från databasen.
        // I en verklig app skulle detta vara ett komplext anrop mot t.ex. Firestore 
        // för att hämta fakturor, tidrapporter, materialkostnader etc. för projektet.
        const financialData = {
            revenue: 150000,
            materialCosts: 45000,
            laborCosts: 60000,
            projectName: `Projekt ${projectId}`
        };

        // Steg 2: Använd en LLM för att formatera datan till en SIE-4 sträng.
        const llmResponse = await generate({
            model: heavyDuty,
            prompt: `Agera som en expert på svensk redovisning. Baserat på följande JSON-data för ett projekt, generera innehållet för en komplett och korrekt SIE 4-fil. Inkludera alla nödvändiga headers och standardkonton. Svara ENDAST med själva filinnehållet, ingenting annat.\n\nJSON-data: ${JSON.stringify(financialData)}`,
            config: { temperature: 0.0 } // Strikt och deterministiskt
        });
        
        const sieContent = llmResponse.text();
        if (!sieContent) {
            throw new Error("Kunde inte generera SIE-4 innehåll.");
        }

        // Steg 3: Använd ett verktyg för att spara filen och få en nedladdningslänk.
        const downloadUrl = await saveSie4FileToStorage({ sieContent, projectId });

        console.log(`[Flow:generateSie4Flow] SIE-4 fil genererad och tillgänglig på: ${downloadUrl}`);
        return downloadUrl;
    }
);
