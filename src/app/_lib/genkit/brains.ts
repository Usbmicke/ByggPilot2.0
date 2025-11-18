
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { gemini15Flash, googleSearchRetriever } from '@genkit-ai/googleai';
import { defineTool, Tool } from '@genkit-ai/ai';
import { generate } from '@genkit-ai/ai';
import { FlowAuth, getFlowAuth } from '@genkit-ai/flow';
import { getUserProfile } from '../dal/dal'; // Antag att denna funktion finns för att hämta profil

// =================================================================================
// MODELLER
// =================================================================================

const workhorse = gemini15Flash; // Gemini 2.5 Flash

// =================================================================================
// FAS 2.1: BRANSCHENS HJÄRNA (Publik RAG)
// =================================================================================

const branschstandardRetriever = defineTool(
  {
    name: 'branschstandardRetriever',
    description: 'Söker i en kunskapsdatabas med svenska byggstandarder, inklusive BBR, AMA och AFS.',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (query) => {
    console.log(`[Branschens Hjärna] Söker efter: "${query}"`);
    return `Simulerat sökresultat för "${query}": Enligt BBR 29, sektion 5:533, ska alla utrymmen ha tillräcklig ventilation.`;
  }
);

export const askBranschensHjärnaFlow = defineFlow(
  {
    name: 'askBranschensHjärnaFlow',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.string(),
  },
  async ({ prompt }) => {
    console.log(`[Branschens Hjärna] Startar flöde för prompt: "${prompt}"`);
    const context = await branschstandardRetriever(prompt);
    const finalResponse = await generate({
      model: workhorse,
      prompt: `Du är en expert på svenska byggregler. Svara på användarens fråga baserat ENDAST på följande kontext. Svara på svenska.\n\nKontext: "${context}"\n\nFråga: "${prompt}"`,
      config: { temperature: 0.2 }
    });
    return finalResponse.text();
  }
);

// =================================================================================
// FAS 2.2: FÖRETAGETS HJÄRNA (Privat RAG)
// =================================================================================

// Verktyg för att söka i privat, företags-specifik data i Firestore
const firestoreRetrieverTool: Tool = {
  name: 'firestoreRetriever',
  description: 'Söker i företagets privata dokument och data, såsom detaljplaner och offerter.',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.string(),
  async run(input, context) {
    const auth = context?.auth as FlowAuth;
    if (!auth?.uid) {
      throw new Error("Autentisering krävs för att söka i företagsdata.");
    }
    console.log(`[Företagets Hjärna] Användare ${auth.uid} söker efter: "${input.query}"`);
    return `Simulerat sökresultat från Firestore för frågan "${input.query}": I projekt P-123 är nästa milstolpe 'Grundläggning' den 2025-12-01.`;
  },
};

export const askFöretagetsHjärnaFlow = defineFlow(
  {
    name: 'askFöretagetsHjärnaFlow',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.string(),
    authPolicy: (auth, input) => {
      if (!auth) throw new Error('Autentisering krävs.');
    },
  },
  async ({ prompt }, context) => {
    console.log(`[Företagets Hjärna] Startar flöde för prompt: "${prompt}"`);
    const privateContext = await firestoreRetrieverTool.run({ query: prompt }, { auth: context.auth });
    const finalResponse = await generate({
      model: workhorse,
      prompt: `Du är en assistent som har tillgång till företagets interna projektdata. Svara på användarens fråga baserat ENDAST på följande kontext. Svara på svenska.\n\nKontext: "${privateContext}"\n\nFråga: "${prompt}"`,
      config: { temperature: 0.1 }
    });
    return finalResponse.text();
  }
);

// =================================================================================
// FAS 2.3 & 3: CHATT-ORKESTRERING (UPPDATERAD)
// =================================================================================

enum Brain {
  None = 'none',
  Public = 'public', 
  Private = 'private', 
  General = 'general',
  SpecialFunction = 'special', // NYTT VAL FÖR FAS 3
}

export const chatOrchestratorFlow = defineFlow(
  {
    name: 'chatOrchestratorFlow',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.object({
      brain: z.nativeEnum(Brain),
      reasoning: z.string(),
    }),
    authPolicy: (auth, input) => {
      if (!auth) throw new Error('Autentisering krävs.');
    },
  },
  async ({ prompt }) => {
    console.log(`[Orchestrator] Klassificerar prompt: "${prompt}"`);

    const llmResponse = await generate({
      model: workhorse,
      prompt: `Du är en AI-assistent i en app för byggföretag. Din uppgift är att klassificera användarens fråga för att avgöra vilken informationskälla som bäst kan besvara den. Svara med ett JSON-objekt med fälten "brain" och "reasoning".\n\nFöljande val finns för "brain":\n- \"public\": Använd om frågan handlar om allmänna byggregler, standarder eller lagar (t.ex. BBR, AMA, AFS).\n- \"private\": Använd om frågan rör specifik information om användarens pågående projekt, kunder, offerter, eller interna företagsdokument.\n- \"special\": Använd om frågan antyder att en avancerad, specifik åtgärd kan utföras, som att skapa en rapport från ljud, analysera spillmaterial, generera en offert, eller exportera bokföringsdata.\n- \"general\": Använd för allmänna frågor, konversation, eller när en webbsökning är mest lämplig.\n\nExempel:\n- Fråga: \"Vilka krav gäller för ventilation i nya badrum?\" -> { \"brain\": \"public\", \"reasoning\": \"Frågan handlar om en allmän byggregel (BBR).\" }\n- Fråga: \"Vad är status för projektet på Storgatan 5?\" -> { \"brain\": \"private\", \"reasoning\": \"Frågan rör ett specifikt, internt projekt.\" }\n- Fråga: \"Jag spelade precis in en genomgång av ett ÄTA-jobb, kan du hjälpa mig?\" -> { \"brain\": \"special\", \"reasoning\": \"Användaren nämner en inspelning för en ÄTA, vilket matchar Röst-till-ÄTA funktionen.\" }\n- Fråga: \"Kan du skapa en offert för en badrumsrenovering åt familjen Andersson?\" -> { \"brain\": \"special\", \"reasoning\": \"Användaren vill skapa en offert, vilket matchar Offertgeneratorn.\" }\n- Fråga: \"Hur många skruvar går det åt per gipsskiva?\" -> { \"brain\": \"general\", \"reasoning\": \"Detta är en allmän byggfråga som bäst besvaras med en webbsökning.\" }\n- Fråga: \"Hej, hur mår du idag?\" -> { \"brain\": \"general\", \"reasoning\": \"Detta är en social konversation.\" }\n\nAnvändarens fråga: "${prompt}"`,
      output: {
        schema: z.object({
          brain: z.nativeEnum(Brain),
          reasoning: z.string(),
        }),
      },
      config: { temperature: 0.0 }
    });
    
    const result = llmResponse.output();
    console.log(`[Orchestrator] Resultat: ${JSON.stringify(result)}`);
    return result;
  }
);
