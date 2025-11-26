
import { defineTool } from '@genkit-ai/ai';
import { z } from 'zod';
import { firestore } from '@/lib/config/firebase-admin';

export const setOnboardingStatus = defineTool(
  {
    name: 'setOnboardingStatus',
    description: 'Sets the onboarding status for a user in Firestore.',
    inputSchema: z.object({
      uid: z.string(),
      status: z.boolean(),
    }),
    outputSchema: z.void(),
  },
  async ({ uid, status }) => {
    await firestore.collection('users').doc(uid).update({ hasOnboarded: status });
  }
);
