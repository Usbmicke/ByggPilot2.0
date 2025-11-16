'use client';
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { getGoogleDriveClient } from './google-drive';

// Konfigurera Genkit med Firebase och Google AI
configureGenkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
//  ONBOARDING FLOW
// =================================================================================

export const completeOnboarding = defineFlow(
  {
    name: 'completeOnboarding',
    inputSchema: z.void(), // Inget input behövs, vi använder auth-context
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    middleware: [async (input, next, context) => {
        // Auth-guard: Se till att anropet har en giltig Firebase Auth-användare
        if (!context?.auth) {
          throw new Error("Autentisering krävs för detta anrop.");
        }
        return next(input);
    }],
  },
  async (input, context) => {
    const userId = context.auth?.uid;
    if (!userId) {
      throw new Error("Användar-ID kunde inte hittas i autentiseringskontexten.");
    }

    console.log(`[Onboarding Flow] Startar för användare: ${userId}`);

    try {
      const drive = await getGoogleDriveClient(userId);

      // 1. Skapa rotmappen "ByggPilot"
      console.log("[Onboarding Flow] Skapar rotmapp i Google Drive...");
      const rootFolderResponse = await drive.files.create({
        requestBody: {
          name: 'ByggPilot',
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      const rootFolderId = rootFolderResponse.data.id;
      if (!rootFolderId) {
        throw new Error("Kunde inte skapa rotmappen i Google Drive.");
      }
      console.log(`[Onboarding Flow] Rotmapp skapad med ID: ${rootFolderId}`);

      // 2. Skapa undermappen "Kunder"
      console.log("[Onboarding Flow] Skapar undermapp för Kunder...");
      await drive.files.create({
        requestBody: {
          name: 'Kunder',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolderId],
        },
      });

      // 3. Uppdatera användarprofilen i Firestore
      console.log("[Onboarding Flow] Uppdaterar användarprofil i Firestore...");
      const userDocRef = adminDb.collection('users').doc(userId);
      await userDocRef.update({
        isOnboarded: true,
        googleDriveRootFolderId: rootFolderId, // Spara ID för framtida bruk
      });
      console.log("[Onboarding Flow] Användarprofil uppdaterad.");

      return {
        success: true,
        message: "Onboarding slutförd! Mappar har skapats och profilen har uppdaterats.",
      };

    } catch (error: any) {
      console.error("[Onboarding Flow Error]", error.message);
      // Logga hela felobjektet för felsökning
      console.error(error);
      return {
        success: false,
        message: `Ett fel inträffade: ${error.message}`,
      };
    }
  }
);
