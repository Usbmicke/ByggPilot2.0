
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth'; // Korrigerad import
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
    auth: firebaseAuth((user) => {
      if (!user) {
        throw new Error('Authentication is required to run this flow.');
      }
      // Du kan lägga till ytterligare logik här, t.ex. rollkontroller
    }),
  },
  async (input, { auth }) => {
    // 'auth' är nu tillgänglig här tack vare auth-policyn
    const uid = auth.uid;

    const folderResult = await run(createCompanyFolderFlow, {
      companyName: input.companyName,
    });

    await updateUserCompany(uid, {
      companyName: input.companyName,
      logoUrl: input.logoUrl,
      driveRootFolderId: folderResult.folderId,
    });

    return { success: true, driveRootFolderId: folderResult.folderId };
  }
);
