
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow, run } from '@genkit-ai/flow';
import { googleAI, gemini15Flash, gemini15Pro } from '@genkit-ai/googleai';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserAfterCreate } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
import { createUserProfile } from '../../lib/dal';
import { MessageData } from '../../lib/schemas';
import { generate } from '@genkit-ai/ai';
import { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow } from './brains';
import { audioToAtaFlow } from './specialized-flows'; // IMPORTERA NYTT FLÖDE

// =================================================================================
// GRUNDKONFIGURATION OCH MODELLER
// =================================================================================

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const workhorse = gemini15Flash; 
const heavyDuty = gemini15Pro;   
const vision = gemini15Flash;    

configureGenkit({
  plugins: [
    firebase(),
    googleAI(), 
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
// EXPORTERADE FLÖDEN (För deployment)
// =================================================================================

// Säkerställer att alla flöden är deploybara som individuella cloud functions
export { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow, audioToAtaFlow };

// =================================================================================
// BAKGRUNDSFLÖDEN
// =================================================================================

export const onusercreate = onUserAfterCreate(async (user) => {
  logger.info(`Ny användare skapad: ${user.data.uid}, E-post: ${user.data.email}`);
  if (!user.data.email) {
    logger.error('Användare skapad utan e-postadress.', { uid: user.data.uid });
    return;
  }
  try {
    const newUserProfile = await createUserProfile(user.data.uid, user.data.email);
    logger.info('Användarprofil skapad i Firestore:', newUserProfile);
  } catch (error) {
    logger.error('Fel vid skapande av användarprofil:', { uid: user.data.uid, error });
  }
});


// =================================================================================
// MODELL-ROUTER-FLÖDE
// =================================================================================

const intentSchema = z.enum(['enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'ljud_uppgift', 'okänd']);

export const chatRouterFlow = onFlow(
  {
    name: 'chatRouterFlow',
    inputSchema: z.object({ history: z.array(MessageData), prompt: z.string() }),
    outputSchema: z.string(), 
    authPolicy: (auth, input) => {
      if (!auth.uid) {
        throw new Error('Användare måste vara inloggad.');
      }
    },
  },
  async ({ history, prompt }) => {
    logger.info(`[chatRouterFlow] Mottog prompt: "${prompt}"`);

    const classificationResponse = await generate({
      model: workhorse,
      prompt: `Klassificera följande användarfråga. Svara ENDAST med ett av följande ord: 'enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'ljud_uppgift'. Fråga: "${prompt}"`,
      output: {
        schema: z.object({ classification: intentSchema.default('okänd') })
      },
      config: { temperature: 0.0 }
    });

    const intent = classificationResponse.output()?.classification ?? 'okänd';
    logger.info(`[chatRouterFlow] Klassificerad intention: "${intent}"`);

    switch (intent) {
      case 'bransch_fråga':
        logger.info('[Router] Dirigerar till "Branschens Hjärna" (RAG)...');
        return await run('askBranschensHjärnaFlow', { prompt });
      
      case 'företags_fråga':
        logger.info('[Router] Dirigerar till "Företagets Hjärna" (Firestore RAG)...');
        return await run('askFöretagetsHjärnaFlow', { prompt });

      case 'komplex_analys':
        logger.info('[Router] Dirigerar till "Komplex Analys" (asynkron)...');
        // return await run('runComplexAnalysisFlow', { prompt }); 
        return "Simulerat svar: Analysen har startat...";

      case 'enkel_chatt':
      default:
        logger.info('[Router] Hanterar som "Enkel Chatt"...');
        const simpleChatResponse = await generate({
          model: workhorse,
          history: history.map(m => ({ role: m.role, content: [{ text: m.content }] })),
          prompt: prompt,
        });
        return simpleChatResponse.text();
    }
  }
);
