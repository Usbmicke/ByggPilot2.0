
import { defineTool } from '@genkit-ai/ai';
import { z } from 'zod';
import { google } from 'googleapis';
import { googleClient } from '@/lib/config/google-client';

export const createGoogleDriveFolder = defineTool(
  {
    name: 'createGoogleDriveFolder',
    description: 'Create a new folder in Google Drive.',
    inputSchema: z.object({
      folderName: z.string(),
    }),
    outputSchema: z.object({
      folderId: z.string(),
    }),
  },
  async ({ folderName }) => {
    const drive = google.drive({ version: 'v3', auth: await googleClient });
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    return { folderId: file.data.id! };
  }
);
