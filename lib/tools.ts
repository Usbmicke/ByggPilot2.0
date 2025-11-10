
// =================================================================================
// GENKIT TOOLS - INTEGRATIONER MED EXTERNA SYSTEM
// =================================================================================
// Denna fil definierar återanvändbara "verktyg" som Genkit-flöden kan anropa
// för att interagera med externa API:er eller utföra komplexa operationer.
// =================================================================================

import { defineTool } from '@genkit-ai/tool';
import { z } from 'zod';
import { google } from 'googleapis';
import * as fs from 'fs/promises';

// TODO: Konfigurera OAuth2-klienten för Google Drive.
// const auth = new google.auth.OAuth2(...);
// const drive = google.drive({ version: 'v3', auth });

/**
 * Ett Genkit Tool för att skapa en standardiserad projektmappsstruktur i Google Drive.
 */
export const googleDriveTool = defineTool(
  {
    name: 'googleDriveTool',
    description: 'Verktyg för att skapa en standard projektmappsstruktur i Google Drive.',
    schema: z.object({
        companyName: z.string().describe("Namnet på företaget, som blir namnet på huvudmappen.")
    }),
    outputSchema: z.object({
        mainFolderId: z.string(),
        subFolderIds: z.record(z.string()),
    }),
  },
  async ({ companyName }) => {
    console.log(`[Simulerat Tool] Skapar mappstruktur för: ${companyName}`);
    const mainFolderId = `sim_drive_${Date.now()}`;
    const subFolderIds: Record<string, string> = {
        'Ritningar': `sim_drive_sub_${Date.now()}`,
        'Offerter': `sim_drive_sub_${Date.now()+1}`,
    };
    console.log(`[Simulerat Tool] Huvudmapp skapad med ID: ${mainFolderId}`);
    return { mainFolderId, subFolderIds };
  }
);


const QuoteItemSchema = z.object({
  description: z.string().describe("Beskrivning av arbetet eller materialet."),
  quantity: z.number().describe("Antal."),
  unit: z.string().describe("Enhet, t.ex. 'tim', 'st', 'm2'."),
  unitPrice: z.number().describe("Pris per enhet."),
  total: z.number().describe("Totalpriset för raden."),
});

export const createQuoteTool = defineTool(
  {
    name: 'createQuoteTool',
    description: 'Skapar ett komplett utkast till en offert. Använd detta när användaren vill skapa en offert.',
    schema: z.object({
      customerName: z.string().describe("Kundens namn."),
      projectName: z.string().describe("Projektets namn."),
      items: z.array(QuoteItemSchema).describe("Lista av arbetsmoment och material."),
      totalAmount: z.number().describe("Totala summan exklusive moms."),
    }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (quoteData) => {
    console.log("[Simulerat Tool] Skapar offert:", JSON.stringify(quoteData, null, 2));
    return { success: true, message: `Offerten för '${quoteData.projectName}' har skapats.` };
  }
);


export const getWeatherForecast = defineTool(
    {
        name: 'getWeatherForecast',
        description: 'Hämtar en väderprognos för en given plats.',
        schema: z.object({ location: z.string().describe("Platsen att hämta prognosen för.") }),
        outputSchema: z.object({ report: z.string() }),
    },
    async ({ location }) => {
        console.log(`[Simulerat Tool] Hämtar väderprognos för: ${location}`);
        const forecasts = [
            `Prognosen för ${location}: Soligt och 18 grader, svag vind. Perfekt för utomhusarbete.`,
            `Prognosen för ${location}: Molnigt med risk för skurar på eftermiddagen. Temperatur runt 15 grader.`,
        ];
        return { report: forecasts[Math.floor(Math.random() * forecasts.length)] };
    }
);

export const knowledgeBaseRetriever = defineTool(
    {
        name: 'knowledgeBaseRetriever',
        description: 'Söker i ByggPilots kunskapsbas efter fack-specifik information (t.ex. BSAB-koder).',
        schema: z.object({ query: z.string().describe("Sökfrågan.") }),
        outputSchema: z.string(),
    },
    async ({ query }) => {
        console.log(`[RAG Tool] Söker i kunskapsbasen efter: "${query}"`);
        const knowledgeBase = await fs.readFile('knowledge_base.md', 'utf-8');
        return `Följande är den relevanta informationen som hittades i kunskapsbasen: \n\n${knowledgeBase}`;
    }
);

/**
 * Ett Genkit Tool som analyserar en bild av materialspill.
 */
export const analyzeMaterialSpillTool = defineTool(
    {
        name: 'analyzeMaterialSpillTool',
        description: 'Analyserar en bild för att identifiera och kvantifiera materialspill. Använd detta verktyg när användaren laddar upp en bild och frågar om en analys av den.',
        schema: z.object({
            imageUrl: z.string().url().describe("Den publika URL:en till bilden som ska analyseras."),
        }),
        outputSchema: z.object({
            analysisReport: z.string(),
        }),
    },
    async ({ imageUrl }) => {
        console.log(`[Simulerat Tool] Analyserar bild från URL: ${imageUrl}`);

        // =========================================================================
        // SIMULERAD IMPLEMENTERING (GEMINI BANAN)
        // =========================================================================
        // I en verklig implementation skulle vi här anropa en multimodal modell
        // (som Gemini) med bildens data för att få en analys.

        const analysisReport = "Analysen av bilden är klar. Jag har identifierat cirka 2-3 kvadratmeter spill av gipsskivor (standard 13mm), en mindre mängd spillvirke (troligen 45x95 reglar), samt diverse emballage. Jag rekommenderar att spillet sorteras för återvinning för att minska kostnader och miljöpåverkan.";

        return { analysisReport };
    }
);
