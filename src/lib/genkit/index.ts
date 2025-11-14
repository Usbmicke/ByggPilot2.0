
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow, run } from '@genkit-ai/flow';
import { googleAI, gemini25Flash, gemini25Pro } from '@genkit-ai/googleai';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserAfterCreate } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
import { createUserProfile, getUserProfile } from './dal';
import { MessageData } from './schemas';
import { generate, defineTool } from '@genkit-ai/ai';

// Dessa importeras men kommer inte att återexporteras.
// De är här för att Genkit ska kunna registrera dem.
import { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow } from './brains';
import { 
    audioToAtaFlow, 
    generateQuoteFlow, 
    analyzeSpillWasteFlow,
    generateSie4Flow
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
// KONSTANTER FÖR PROMPTER (För bättre underhåll)
// =================================================================================

const INTENT_CLASSIFICATION_PROMPT = `Klassificera frågan: "{prompt}". Svara med: 'enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'offert_generering', 'okänd'.`;

// =================================================================================
// VERKTYGSDEFINITIONER
// =================================================================================

const tools_default = [
  defineTool({ name: 'askBranschensHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askBranschensHjärnaFlow', { prompt })),
  defineTool({ name: 'askForetagetsHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askFöretagetsHjärnaFlow', { prompt })),
];

const tools_heavy = [
  ...tools_default,
  // Lägg till eventuella verktyg som endast "Experten" ska ha tillgång till här
];

// =================================================================================
// SYNKRONISERING & ORKESTRERING (NY ARKITEKTUR)
// =================================================================================

/**
 * Bakgrunds-trigger som körs ENBART när en Firebase-användare skapas FÖRSTA gången.
 */
export const onusercreate = onUserAfterCreate(async (user) => {
  logger.info(`Ny användare skapad i Firebase Auth: ${user.data.uid}`);
  await createUserProfile({ userId: user.data.uid, email: user.data.email || '' });
});

/**
 * Huvudflöde för autentisering. Anropas från frontend för att säkerställa att en
 * användarprofil existerar och för att hämta onboarding-status.
 */
export const getOrCreateUserAndCheckStatusFlow = onFlow(
    {
        name: 'getOrCreateUserAndCheckStatusFlow',
        inputSchema: z.void(),
        outputSchema: z.object({
            userExists: z.boolean(),
            isOnboarded: z.boolean(),
        }),
        authPolicy: (auth, input) => {
            if (!auth || !auth.uid) {
                throw new Error('Användare måste vara autentiserad.');
            }
        },
    },
    async (input, context) => {
        const userId = context.auth!.uid;
        const userEmail = context.auth!.email || '';

        logger.info(`Kör getOrCreateUserAndCheckStatusFlow för användare: ${userId}`);

        let userProfile = await getUserProfile(userId);
        let userExists = true;

        if (!userProfile) {
            logger.info(`Profil saknas för ${userId}, skapar ny profil...`);
            userExists = false;
            userProfile = await createUserProfile({ userId, email: userEmail });
        }

        logger.info(`Profil hittades för ${userId}. Onboarding-status: ${userProfile.onboardingStatus}`);

        return {
            userExists: userExists,
            isOnboarded: userProfile.onboardingStatus === 'complete',
        };
    }
);

// =================================================================================
// KÄRNFLÖDE FÖR CHATT (Tidigare "chatOrchestratorFlow")
// =================================================================================

function isFailureResponse(responseText: string): boolean {
    const failureKeywords = ['tyvärr', 'inte kan', 'misslyckades', 'vet inte'];
    return failureKeywords.some(keyword => responseText.toLowerCase().includes(keyword));
}

export const chatFlow = onFlow(
  {
    name: 'chatFlow', // NAMN-FIX: Bytt från chatOrchestratorFlow
    inputSchema: z.object({ history: z.array(MessageData), prompt: z.string() }),
    outputSchema: z.string(), 
    authPolicy: (auth, input) => { if (!auth || !auth.uid) { throw new Error('Användare måste vara inloggad.'); } },
  },
  async ({ history, prompt }) => {
    
    // Dirigering baserat på avsikt
    const intentResponse = await generate({
      model: workhorse,
      prompt: INTENT_CLASSIFICATION_PROMPT.replace('{prompt}', prompt), // REFAKTOR: Använder konstant
      output: { schema: z.object({ classification: z.enum(['enkel_chatt', 'bransch_fråga', 'företags_fråga', 'komplex_analys', 'offert_generering', 'okänd']).default('okänd') }) },
    });
    const intent = intentResponse.output()?.classification ?? 'okänd';
    
    // Konvertera historik till det format som Genkit `generate` förväntar sig
    // BUGG-FIX: `content` ska vara en sträng, inte ett objekt { text: ... }
    const modelHistory = history.map(m => ({ role: m.role, content: m.content }));

    // Om avsikten kräver "Experten"
    if (intent === 'komplex_analys' || intent === 'offert_generering') {
      const proResponse = await generate({ model: heavyDuty, history: modelHistory, prompt, tools: tools_heavy });
      return proResponse.text();
    }

    // Annars, använd "Arbetsmyran"
    const flashResponse = await generate({ model: workhorse, history: modelHistory, prompt, tools: tools_default });

    // Fallback till "Experten" om "Arbetsmyran" misslyckas
    if (isFailureResponse(flashResponse.text())) {
      const retryResponse = await generate({ model: heavyDuty, history: modelHistory, prompt: `Försök igen: "${prompt}"`, tools: tools_heavy });
      return retryResponse.text();
    }

    return flashResponse.text();
  }
);
