
'use client';
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { getGoogleDriveClient } from './google-drive';
import { completeUserOnboarding, getCompanyName, saveCompanyInfo as saveCompanyInfoToDb } from '@/app/_lib/dal/dal';

configureGenkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
//  NYTT FLOW: Spara Företagsinformation
// =================================================================================

export const saveCompanyInfo = defineFlow(
  {
    name: 'saveCompanyInfo',
    inputSchema: z.object({ companyName: z.string(), companyAddress: z.string() }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    cors: { origin: "*", methods: "POST" },
    middleware: [async (input, next, context) => {
        if (!context?.auth) {
          throw new Error("Autentisering krävs.");
        }
        return next(input);
    }],
  },
  async (input, context) => {
    const userId = context.auth?.uid;
    if (!userId) {
      return { success: false, message: "Användar-ID saknas." };
    }

    try {
      await saveCompanyInfoToDb(userId, input.companyName, input.companyAddress);
      return { success: true, message: 'Företagsinformation har sparats.' };
    } catch (error: any) {
      console.error("[Save Company Info Error]", error.message);
      return { success: false, message: `Ett fel inträffade: ${error.message}` };
    }
  }
);


// =================================================================================
//  ONBOARDING FLOW V2 - Med CORS & Korrekt Mappstruktur
// =================================================================================

export const completeOnboarding = defineFlow(
  {
    name: 'completeOnboarding',
    inputSchema: z.void(),
    outputSchema: z.object({ success: z.boolean(), message: z.string(), driveFolderUrl: z.string().optional() }),
    cors: { origin: "*", methods: "POST" },
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
      return { success: false, message: "Användar-ID kunde inte hittas i autentiseringskontexten." };
    }

    console.log(`[Onboarding Flow v2] Startar för användare: ${userId}`);

    try {
      const drive = await getGoogleDriveClient(userId);
      const companyName = await getCompanyName(userId); // Hämta företagsnamn från DAL
      const rootFolderName = `ByggPilot - ${companyName || 'Mitt Företag'}`;

      console.log(`[Onboarding Flow v2] Skapar rotmapp: "${rootFolderName}"`);
      const rootFolderResponse = await drive.files.create({
        requestBody: {
          name: rootFolderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id, webViewLink',
      });
      const rootFolderId = rootFolderResponse.data.id;
      const rootFolderUrl = rootFolderResponse.data.webViewLink;

      if (!rootFolderId || !rootFolderUrl) {
        throw new Error("Kunde inte skapa rotmappen i Google Drive.");
      }
      console.log(`[Onboarding Flow v2] Rotmapp skapad med ID: ${rootFolderId}`);

      const subFolders = [
        '1. Kundprojekt',
        '2. Leverantörsfakturor',
        '3. KMA-Dokumentation',
        '4. Avtal & Offerer'
      ];

      for (const folderName of subFolders) {
        console.log(`[Onboarding Flow v2] Skapar undermapp: "${folderName}"`);
        await drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootFolderId],
          },
        });
      }

      console.log("[Onboarding Flow v2] Anropar DAL för att uppdatera användarprofil...");
      await completeUserOnboarding(userId, rootFolderId);
      console.log("[Onboarding Flow v2] DAL-anrop slutfört.");

      return {
        success: true,
        message: "Onboarding slutförd! Mappar har skapats och profilen har uppdaterats.",
        driveFolderUrl: rootFolderUrl,
      };

    } catch (error: any) {
      console.error("[Onboarding Flow v2 Error]", error.message);
      return {
        success: false,
        message: `Ett fel inträffade: ${error.message}`,
      };
    }
  }
);
