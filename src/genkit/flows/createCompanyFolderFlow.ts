
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth'; // Korrigerad import
import { createFolder } from '../dal/googleDrive.repo';

export const createCompanyFolderFlow = defineFlow(
  {
    name: 'createCompanyFolderFlow',
    inputSchema: z.object({ companyName: z.string() }),
    outputSchema: z.object({ folderId: z.string() }),
    auth: firebaseAuth((user) => {
      if (!user) throw new Error('Authentication is required.');
    }),
  },
  async ({ companyName }) => {
    const folderId = await createFolder(companyName);
    return { folderId };
  }
);
