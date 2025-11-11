
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { gemini15Pro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';
import { AtaCreationSchema, AtaIdSchema, ProjectIdSchema } from '../../lib/schemas'; // Uppdaterade importer
import { createAta } from '../../lib/dal';
import { FlowAuth } from '@genkit-ai/flow';

// =================================================================================
// MODELLER
// =================================================================================

const heavyDuty = gemini15Pro; // Gemini 2.5 Pro

// =================================================================================
// FAS 3: RÖST-TILL-ÄTA-FLÖDE (audioToAtaFlow) - KORRIGERAD VERSION
// =================================================================================

/**
 * Ett flöde som tar en ljudfil och ett projekt-ID, analyserar ljudet,
 * extraherar information för en ÄTA, och sparar den i databasen.
 */
export const audioToAtaFlow = defineFlow(
    {
        name: 'audioToAtaFlow',
        // Input kräver nu projectId för att veta var ÄTA:n hör hemma
        inputSchema: z.object({ 
            audioUrl: z.string().url(),
            projectId: ProjectIdSchema 
        }),
        outputSchema: z.object({ 
            ataId: AtaIdSchema, 
            message: z.string() 
        }),
        authPolicy: (auth, input) => {
            if (!auth) throw new Error('Autentisering krävs.');
        },
    },
    async ({ audioUrl, projectId }, context) => {
        const auth = context.auth as FlowAuth;
        if (!auth?.uid) throw new Error('Kunde inte verifiera användar-ID.');

        console.log(`[audioToAtaFlow] Startar flöde för ljudfil: ${audioUrl} i projekt: ${projectId}`);

        // Steg 1: Använd heavyDuty-modellen för att analysera ljudet och tvinga JSON-output
        const llmResponse = await generate({
            model: heavyDuty,
            prompt: `Analysera följande ljudinspelning. Det är en hantverkare som rapporterar en ÄTA (Ändringar, Tillägg, Avgående). Extrahera titel, en detaljerad beskrivning och en uppskattad kostnad. Svara ENBART med JSON-objektet, inget annat. Ljudinspelning: ${audioUrl}`,
            output: {
                schema: AtaCreationSchema, // Använd det nya, begränsade schemat
                format: 'json',
            },
        });

        const extractedData = llmResponse.output();
        if (!extractedData) {
            throw new Error("Kunde inte extrahera ÄTA-information från ljudfilen.");
        }

        console.log("[audioToAtaFlow] Extraherad ÄTA-data:", extractedData);

        // Steg 2: Skapa det fullständiga ÄTA-objektet för databasen
        const ataToCreate = {
            projectId: projectId,
            userId: auth.uid, // Säkerställ att rätt användare är satt
            ...extractedData,
        };

        // Steg 3: Anropa vår DAL-funktion direkt för att spara i databasen. Säkert och enkelt.
        const newAtaId = await createAta(ataToCreate);

        return {
            ataId: newAtaId,
            message: "En ny ÄTA har skapats framgångsrikt från din ljudinspelning!",
        };
    }
);
