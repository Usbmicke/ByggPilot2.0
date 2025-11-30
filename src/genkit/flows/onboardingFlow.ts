
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase';
import { updateUserCompany } from '../dal/user.repo';
import { createCompanyFolderFlow } from './createCompanyFolderFlow';

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: z.object({
      companyName: z.string(),
      logoUrl: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      driveRootFolderId: z.string().optional(),
    }),
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error('Authentication is required.');
      }
    }),
  },
  async (input, { auth }) => {
    if (!auth) {
      throw new Error('Authentication context is missing.');
    }

    const folderResult = await run('create-company-folder', () =>
      createCompanyFolderFlow.run({ companyName: input.companyName })
    );

    if (!folderResult.folderId) {
      throw new Error('Failed to create company folder in Google Drive.');
    }

    await updateUserCompany(auth.uid, {
      companyName: input.companyName,
      driveRootFolderId: folderResult.folderId,
      logoUrl: input.logoUrl, 
    });

    return {
      success: true,
      driveRootFolderId: folderResult.folderId,
    };
  }
);
