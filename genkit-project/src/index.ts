
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow, run } from '@genkit-ai/flow';
import { googleAI, gemini25Flash, gemini25Pro } from '@genkit-ai/googleai';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserAfterCreate } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
// Importera ALLA funktioner från den korrekta DAL-filen
import { createUserProfile, getUserProfile } from './dal';
import { MessageData } from '../../lib/schemas'; // Denna import är fortfarande lite suspekt, men vi låter den vara för nu.
import { generate, defineTool } from '@genkit-ai/ai';
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
// VERKTYGSDEFINITIONER
// =================================================================================

const tools_default = [
  defineTool({ name: 'askBranschensHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askBranschensHjärnaFlow', { prompt })),
  defineTool({ name: 'askForetagetsHjarna', inputSchema: z.object({ prompt: z.string() }), outputSchema: z.string() }, async ({ prompt }) => run('askFöretagetsHjärnaFlow', { prompt })),
];

const tools_heavy = [
  ...tools_default,
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
    generateSie4Flow
}; 

// =================================================================================
// SYNKRONISERING & ORKESTRERING (NY ARKITEKTUR)
// =================================================================================

/**
 * Bakgrunds-trigger som körs ENBART när en Firebase-användare skapas FÖRSTA gången.
 * Detta säkerställer att en bas-profil alltid finns.
 */
export const onusercreate = onUserAfterCreate(async (user) => {
  logger.info(`Ny användare skapad i Firebase Auth: ${user.data.uid}`);
  await createUserProfile({ userId: user.data.uid, email: user.data.email || '' });
});

/**
 * Detta är huvudflödet för autentisering som anropas från frontend (AuthProvider).
 * Det körs VARJE gång en användare loggar in eller när sidan laddas om.
 * Det skapar en användarprofil om den saknas och returnerar användarens onboarding-status.
 */
export const getOrCreateUserAndCheckStatusFlow = onFlow(
    {
        name: 'getOrCreateUserAndCheckStatusFlow',
        inputSchema: z.void(), // Inga argument behövs från klienten
        outputSchema: z.object({
            userExists: z.boolean(),
            isOnboarded: z.boolean(),
        }),
        // SÄKERHET: authPolicy säkerställer att endast inloggade användare kan anropa detta.
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

        if (!userProfile) {
            logger.info(`Profil saknas för ${userId}, skapar ny profil...`);
            await createUserProfile({ userId, email: userEmail });
            userProfile = await getUserProfile(userId); // Hämta den nyskapade profilen

            // Om den fortfarande inte finns, kasta ett fel.
            if (!userProfile) {
                logger.error(`Kritiskt fel: Misslyckades med att skapa och hämta profil för ${userId}`);
                throw new Error('Kunde inte skapa eller verifiera användarprofil.');
            }

            return {
                userExists: false, // Indikerar att profilen just skapades
                isOnboarded: false, // Nya profiler är aldrig onboardade
            };
        }

        logger.info(`Profil hittades för ${userId}. Onboarding-status: ${userProfile.onboardingStatus}`);

        return {
            userExists: true,
            isOnboarded: userProfile.onboardingStatus === 'complete',
        };
    }
);


// =================================================================================
// BEFINTLIGT CHAT-FLÖDE (Lätt modifierat för kontext)
// =================================================================================

function isFailureResponse(responseText: string): boolean {
    const failureKeywords = ['tyvärr', 'inte kan', 'misslyckades', 'vet inte'];
    return failureKeywords.some(keyword => responseText.toLowerCase().includes(keyword));
}

export const chatOrchestratorFlow = onFlow(
  {
    name: 'chatOrchestratorFlow',
    inputSchema: z.object({ history: z.array(MessageData), prompt: z.string() }),
    outputSchema: z.string(), 
    authPolicy: (auth, input) => { if (!auth || !auth.uid) { throw new Error('Användare måste vara inloggad.'); } },
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
