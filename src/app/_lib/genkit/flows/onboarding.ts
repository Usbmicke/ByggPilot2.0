
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { google } from 'googleapis';
import admin from 'firebase-admin';
import { getGoogleDriveClient } from '@/app/_lib/config/google-drive-client';

// ====================================================================
// DEFINIERA FLÖDET OCH DESS INPUT/OUTPUT
// ====================================================================

export const createOnboardingFolderStructureFlow = defineFlow(
  {
    name: 'createOnboardingFolderStructure',
    inputSchema: z.object({
      companyId: z.string(),
      companyName: z.string(),
    }),
    outputSchema: z.object({
      driveRootFolderId: z.string(),
      driveRootFolderUrl: z.string(),
    }),
  },
  async (input) => {
    console.log(`[Genkit Flow] Startar mappskapande för: ${input.companyName}`);

    const drive = await getGoogleDriveClient();

    // 1. Skapa rotmappen
    const rootFolderName = `ByggPilot - ${input.companyName}`;
    const rootFolderMetadata = {
      name: rootFolderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const rootFolder = await drive.files.create({
      requestBody: rootFolderMetadata,
      fields: 'id, webViewLink',
    });

    const rootFolderId = rootFolder.data.id;
    if (!rootFolderId) {
      throw new Error('Kunde inte skapa rotmapp i Google Drive.');
    }

    console.log(`[Genkit Flow] Rotmapp skapad med ID: ${rootFolderId}`);

    // 2. Definiera och skapa undermappar
    const subfolders = [
      '01 - Projekt',
      '02 - Avtal & Offert',
      '03 - Leverantörer & UE',
      '04 - Kunder',
      '05 - Personal & Tidrapporter',
      '06 - Ekonomi & Fakturering',
      '07 - Kvalitet & Miljö',
      '08 - Internt',
    ];

    for (const folderName of subfolders) {
      const subfolderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      };
      await drive.files.create({
        requestBody: subfolderMetadata,
        fields: 'id',
      });
      console.log(`[Genkit Flow] Skapade undermapp: ${folderName}`);
    }

    console.log(`[Genkit Flow] Hela mappstrukturen skapad för ${input.companyName}.`);

    // 3. Returnera resultatet
    return {
      driveRootFolderId: rootFolderId,
      driveRootFolderUrl: rootFolder.data.webViewLink || '',
    };
  }
);
