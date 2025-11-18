'use client';
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { getGoogleDriveClient } from './google-drive';
// Importera DAL-funktionen, inte adminDb direkt!
import { completeUserOnboarding } from '@/lib/dal/dal';

configureGenkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
//  ONBOARDING FLOW (Refaktorerad enligt Guldstandard)
// =================================================================================

export const completeOnboarding = defineFlow(
  {
    name: 'completeOnboarding',
    inputSchema: z.void(),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    middleware: [async (input, next, context) => {
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

      console.log("[Onboarding Flow] Skapar undermapp för Kunder...");
      await drive.files.create({
        requestBody: {
          name: 'Kunder',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolderId],
        },
      });

      // ANROPAR DAL:et! Flödet pratar inte längre direkt med databasen.
      console.log("[Onboarding Flow] Anropar DAL för att uppdatera användarprofil...");
      await completeUserOnboarding(userId, rootFolderId);
      console.log("[Onboarding Flow] DAL-anrop slutfört.");

      return {
        success: true,
        message: "Onboarding slutförd! Mappar har skapats och profilen har uppdaterats.",
      };

    } catch (error: any) {
      console.error("[Onboarding Flow Error]", error.message);
      console.error(error);
      return {
        success: false,
        message: `Ett fel inträffade: ${error.message}`,
      };
    }
  }
);
