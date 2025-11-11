
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { gemini15Flash, googleSearchRetriever } from '@genkit-ai/googleai';
import { defineTool, Tool } from '@genkit-ai/ai';
import { generate } from '@genkit-ai/ai';
import { FlowAuth, getFlowAuth } from '@genkit-ai/flow';
import { getUserProfile } from '../../lib/dal'; // Antag att denna funktion finns för att hämta profil

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

    // Här skulle vi hämta companyId från userProfile
    // const userProfile = await getUserProfile(auth.uid);
    // const companyId = userProfile?.companyId;
    // if (!companyId) { ... }

    // Simulerar ett anrop till Firestore Vector Search med ett companyId-filter
    // const results = await db.collection('documents').where('companyId', '==', companyId).find(...);

    return `Simulerat sökresultat från Firestore för frågan "${input.query}": I projekt P-123 är nästa milstolpe 'Grundläggning' den 2025-12-01.`;
  },
};

/**
 * Flöde för att svara på frågor genom att söka i företagets privata data.
 */
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
    
    // Steg 1: Hämta privat kontext med vårt säkra verktyg
    const privateContext = await firestoreRetrieverTool.run({ query: prompt }, { auth: context.auth });
    
    // Steg 2: Generera svar baserat på den privata kontexten
    const finalResponse = await generate({
      model: workhorse,
      prompt: `Du är en assistent som har tillgång till företagets interna projektdata. Svara på användarens fråga baserat ENDAST på följande kontext. Svara på svenska.\n\nKontext: "${privateContext}"\n\nFråga: "${prompt}"`,
      config: { temperature: 0.1 }
    });
    
    return finalResponse.text();
  }
);
