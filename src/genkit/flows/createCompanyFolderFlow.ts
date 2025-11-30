
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase';
import { createFolder } from '../dal/googleDrive.repo';

export const createCompanyFolderFlow = defineFlow(
  {
    name: 'createCompanyFolderFlow',
    inputSchema: z.object({ companyName: z.string() }),
    outputSchema: z.object({ folderId: z.string() }),
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error('Åtkomst nekad. Användaren måste vara inloggad.');
      }
    }),
  },
  async (input) => {
    const folderId = await createFolder(input.companyName);
    return { folderId };
  }
);
