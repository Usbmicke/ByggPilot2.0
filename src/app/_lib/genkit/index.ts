
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow, run } from '@genkit-ai/flow';
import { googleAI, gemini15Flash, gemini15Pro } from '@genkit-ai/googleai';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserAfterCreate } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
import { createProject, createUserProfile, getUserProfile, updateUserOnboardingStatus } from '../dal/dal'; // Importerar nya funktioner
import { MessageData } from '../schemas/schemas';
import { generate, defineTool } from '@genkit-ai/ai';

// Importer för registrering
import './brains';
import './specialized-flows'; 

// =================================================================================
// GRUNDKONFIGURATION OCH MODELLER
// =================================================================================

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const workhorse = gemini15Flash;
const heavyDuty = gemini15Pro;
const vision = gemini15Pro;

configureGenkit({
  plugins: [ 
      firebase(), 
      googleAI()
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
// SYNKRONISERING, ONBOARDING & ORKESTRERING
// =================================================================================

export const onusercreate = onUserAfterCreate(async (user) => {
  logger.info(`Ny användare i Auth: ${user.data.uid}. Skapar databasprofil...`);
  try {
    await createUserProfile({ userId: user.data.uid, email: user.data.email || '' });
    logger.info(`Profil skapad för ${user.data.uid}.`);
  } catch (error) {
    logger.error(`[CRITICAL] Kunde inte skapa profil för ${user.data.uid}:`, error);
  }
});

export const getOrCreateUserAndCheckStatusFlow = onFlow(
    {
        name: 'getOrCreateUserAndCheckStatusFlow',
        inputSchema: z.void(),
        outputSchema: z.object({
            isNewUser: z.boolean(),
            isOnboarded: z.boolean(),
        }),
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Användare måste vara autentiserad.');
        },
    },
    async (input, context) => {
        const userId = context.auth!.uid;
        logger.info(`Kör getOrCreateUserAndCheckStatusFlow för användare: ${userId}`);

        let userProfile = await getUserProfile(userId);
        let isNewUser = false;

        if (!userProfile) {
            isNewUser = true;
            logger.info(`Profil saknas för ${userId}, skapar en ny...`);
            try {
                userProfile = await createUserProfile({ userId, email: context.auth!.email || '' });
            } catch (error) {
                logger.error(`[CRITICAL] Misslyckades med att skapa profil i säkerhetsnätet för ${userId}:`, error);
                throw new Error('Kunde inte skapa användarprofil.');
            }
        }

        const isOnboarded = userProfile.onboardingStatus === 'complete';
        logger.info(`Status för ${userId}: isNewUser=${isNewUser}, isOnboarded=${isOnboarded}`);

        return {
            isNewUser,
            isOnboarded,
        };
    }
);

/**
 * Flöde för att slutföra onboarding: skapar ett första projekt och uppdaterar användarstatus.
 * Anropas från frontend när användaren slutför onboarding-guiden.
 */
export const createProjectFlow = onFlow(
    {
        name: 'createProjectFlow',
        inputSchema: z.object({
            projectName: z.string().min(3, "Projektnamnet måste vara minst 3 tecken långt."),
        }),
        outputSchema: z.object({
            projectId: z.string(),
        }),
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Användare måste vara autentiserad.');
        },
    },
    async ({ projectName }, context) => {
        const userId = context.auth!.uid;
        logger.info(`[Onboarding] Användare ${userId} skapar sitt första projekt med namn: "${projectName}"`);

        // Steg 1: Skapa projektet i databasen
        const projectId = await createProject({ name: projectName, ownerId: userId });
        logger.info(`[Onboarding] Projekt med ID ${projectId} har skapats för användare ${userId}.`);

        // Steg 2: Uppdatera användarens onboarding-status till 'complete'
        await updateUserOnboardingStatus(userId, 'complete');
        logger.info(`[Onboarding] Användare ${userId} har nu status 'complete'.`);

        // Steg 3: Returnera det nya projekt-ID:t
        return { projectId };
    }
);


// =================================================================================
// CHATT-FLÖDE
// =================================================================================

const INTENT_CLASSIFICATION_PROMPT = `Klassificera frågan: "{prompt}". Svara med: 'enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'offert_generering', 'okänd'.`;
const tools_default = [
  defineTool({ name: 'askBranschensHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askBranschensHjärnaFlow', { prompt })),
  defineTool({ name: 'askForetagetsHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askFöretagetsHjärnaFlow', { prompt })),
];
const tools_heavy = [...tools_default];

function isFailureResponse(responseText: string): boolean {
    const failureKeywords = ['tyvärr', 'inte kan', 'misslyckades', 'vet inte'];
    return failureKeywords.some(keyword => responseText.toLowerCase().includes(keyword));
}

export const chatFlow = onFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({ history: z.array(MessageData), prompt: z.string() }),
    outputSchema: z.string(), 
    authPolicy: (auth, input) => { if (!auth) { throw new Error('Användare måste vara inloggad.'); } },
  },
  async ({ history, prompt }) => {
    const intentResponse = await generate({
      model: workhorse,
      prompt: INTENT_CLASSIFICATION_PROMPT.replace('{prompt}', prompt),
      output: { schema: z.object({ classification: z.enum(['enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'offert_generering', 'okänd']).default('okänd') }) },
    });
    const intent = intentResponse.output()?.classification ?? 'okänd';
    const modelHistory = history.map(m => ({ role: m.role, content: m.content }));

    if (intent === 'komplex_analys' || intent === 'offert_generering') {
      const proResponse = await generate({ model: heavyDuty, history: modelHistory, prompt, tools: tools_heavy });
      return proResponse.text();
    }

    const flashResponse = await generate({ model: workhorse, history: modelHistory, prompt, tools: tools_default });

    if (isFailureResponse(flashResponse.text())) {
      const retryResponse = await generate({ model: heavyDuty, history: modelHistory, prompt: `Försök igen: "${prompt}"`, tools: tools_heavy });
      return retryResponse.text();
    }

    return flashResponse.text();
  }
);
