
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow, run } from '@genkit-ai/flow';
import { googleAI, gemini25Flash, gemini25Pro } from '@genkit-ai/googleai';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserAfterCreate } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
import { createUserProfile } from '../../lib/dal';
import { MessageData } from '../../lib/schemas';
import { generate, defineTool } from '@genkit-ai/ai';
import { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow } from './brains';
import { 
    audioToAtaFlow, 
    generateQuoteFlow, 
    analyzeSpillWasteFlow,
    generateSie4Flow // Importera sista flödet
} from './specialized-flows'; 

// =================================================================================
// GRUNDKONFIGURATION OCH MODELLER (2025-11-12)
// =================================================================================

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const workhorse = gemini25Flash;
const heavyDuty = gemini25Pro;
const vision = gemini25Pro;

configureGenkit({
  plugins: [ firebase(), googleAI() ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
// VERKTYGSDEFINITIONER
// =================================================================================

const tools_default = [
  defineTool({ name: 'askBranschensHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askBranschensHjärnaFlow', { prompt })),
  defineTool({ name: 'askForetagetsHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askFöretagetsHjärnaFlow', { prompt })),
];

const tools_heavy = [
  ...tools_default,
  // Här skulle de riktiga verktygen för offert och SIE-generering ligga
];

// =================================================================================
// EXPORTERADE FLÖDEN
// =================================================================================

export { 
    askBranschensHjärnaFlow, 
    askFöretagetsHjärnaFlow, 
    audioToAtaFlow, 
    generateQuoteFlow, 
    analyzeSpillWasteFlow,
    generateSie4Flow // Exportera sista flödet
}; 

// =================================================================================
// BAKGRUNDSFLÖDEN & HUVUDFLÖDE
// =================================================================================

export const onusercreate = onUserAfterCreate(async (user) => {
  logger.info(`Ny användare: ${user.data.uid}`);
  await createUserProfile({ userId: user.data.uid, email: user.data.email || '' });
});

function isFailureResponse(responseText: string): boolean {
    const failureKeywords = ['tyvärr', 'inte kan', 'misslyckades', 'vet inte'];
    return failureKeywords.some(keyword => responseText.toLowerCase().includes(keyword));
}

export const chatOrchestratorFlow = onFlow(
  {
    name: 'chatOrchestratorFlow',
    inputSchema: z.object({ history: z.array(MessageData), prompt: z.string() }),
    outputSchema: z.string(), 
    authPolicy: (auth, input) => { if (!auth.uid) { throw new Error('Användare måste vara inloggad.'); } },
  },
  async ({ history, prompt }) => {
    const intentResponse = await generate({
      model: workhorse,
      prompt: `Klassificera frågan: "${prompt}". Svara med: 'enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'offert_generering', 'okänd'.`,
      output: { schema: z.object({ classification: z.enum(['enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'offert_generering', 'okänd']).default('okänd') }) },
    });
    const intent = intentResponse.output()?.classification ?? 'okänd';
    
    if (intent === 'komplex_analys' || intent === 'offert_generering') {
      const proResponse = await generate({ model: heavyDuty, history: history.map(m => ({ role: m.role, content: [{ text: m.content }] })), prompt, tools: tools_heavy });
      return proResponse.text();
    }

    const flashResponse = await generate({ model: workhorse, history: history.map(m => ({ role: m.role, content: [{ text: m.content }] })), prompt, tools: tools_default });

    if (isFailureResponse(flashResponse.text())) {
      const retryResponse = await generate({ model: heavyDuty, history: history.map(m => ({ role: m.role, content: [{ text: m.content }] })), prompt: `Försök igen: "${prompt}"`, tools: tools_heavy });
      return retryResponse.text();
    }

    return flashResponse.text();
  }
);
