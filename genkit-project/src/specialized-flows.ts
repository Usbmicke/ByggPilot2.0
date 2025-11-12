
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { googleAI, gemini25Pro } from '@genkit-ai/googleai';
import { generate, defineTool } from '@genkit-ai/ai';
import { AtaCreationSchema, AtaIdSchema, ProjectIdSchema, QuoteCreationSchema } from '../../lib/schemas';
import { createAta, createQuote } from '../../lib/dal';
import { FlowAuth } from '@genkit-ai/flow';
import { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow } from './brains';

// =================================================================================
// MODELLER (2025-11-12)
// =================================================================================

const heavyDuty = gemini25Pro;
const vision = gemini25Pro; // Vision-modellen

// ... (resten av filen är oförändrad fram till slutet)

// =================================================================================
// SPILL-ANALYS-FLÖDE (analyzeSpillWasteFlow) - "ÖGAT"
// =================================================================================

const cutPlanSchema = z.object({
  description: z.string().describe('En sammanfattning av den föreslagna kapningsplanen.'),
  estimatedSavings: z.number().describe('Uppskattad besparing i procent.'),
  cuts: z.array(z.object({
    piece: z.string().describe('Vilken bit som ska kapas.'),
    length: z.number().describe('Längden som ska kapas.'),
    from: z.string().describe('Från vilken spillbit den ska kapas.')
  }))
});

/**
 * Analyserar en bild på spillmaterial och föreslår en optimerad kapningsplan.
 */
export const analyzeSpillWasteFlow = defineFlow(
    {
        name: 'analyzeSpillWasteFlow',
        inputSchema: z.object({ 
            imageUrl: z.string().url().describe('URL till en bild på spillmaterialet.')
        }),
        outputSchema: cutPlanSchema,
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Autentisering krävs.');
        },
    },
    async ({ imageUrl }) => {
        console.log(`[analyzeSpillWasteFlow] Startar analys för bild: ${imageUrl}`);

        const llmResponse = await generate({
            model: vision,
            prompt: `Du är en expert på materialoptimering i byggbranschen. Analysera bilden som finns på följande URL. Identifiera de olika spillbitarna (gipsskivor, reglar, etc.) och deras uppskattade storlekar. Skapa sedan en optimerad kapningsplan för att minimera framtida spill. Svara ENDAST med ett JSON-objekt enligt det specificerade schemat. Bild-URL: ${imageUrl}`,
            output: {
                schema: cutPlanSchema,
                format: 'json'
            }
        });

        const plan = llmResponse.output();
        if (!plan) {
            throw new Error("Kunde inte generera en kapningsplan från bilden.");
        }

        console.log("[analyzeSpillWasteFlow] Genererad kapningsplan:", plan);
        return plan;
    }
);
