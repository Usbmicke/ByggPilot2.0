
import { defineFlow } from '@genkit-ai/flow';
import { createGoogleDriveFolder } from '@/genkit/tools/googleDrive';
import { completeOnboarding } from '@/lib/dal/repositories/user.repo';
import * as z from 'zod';

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: z.object({
      uid: z.string(),
      companyName: z.string(),
      logoUrl: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      folderId: z.string().optional(),
    }),
  },
  async ({ uid, companyName, logoUrl }) => {
    console.log(`[Onboarding Flow] Starting for user: ${uid}, company: ${companyName}`);

    try {
      // Step 1: Create the Google Drive folder.
      const { folderId } = await createGoogleDriveFolder({ folderName: companyName });
      console.log(`[Onboarding Flow] Google Drive folder created: ${folderId}`);

      // Step 2: Update user profile in Firestore with onboarding data.
      await completeOnboarding(uid, { companyName, logoUrl });
      console.log(`[Onboarding Flow] User profile updated in Firestore.`);

      return {
        success: true,
        message: 'Onboarding completed successfully!',
        folderId,
      };
    } catch (error) {
      console.error('[Onboarding Flow] Failed to complete onboarding:', error);
      return {
        success: false,
        message: 'An error occurred during the onboarding process.',
      };
    }
  }
);
