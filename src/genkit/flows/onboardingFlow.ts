
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { updateUserProfile } from '../dal/user.repo';

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: z.object({ displayName: z.string().min(2).max(50) }),
    outputSchema: z.object({ success: z.boolean() }),
    authPolicy: firebaseAuth((user) => {
      if (!user) throw new Error('Användaren måste vara inloggad.');
    }),
  },
  async (input, { auth }) => {
    const uid = auth.uid;
    await updateUserProfile(uid, { displayName: input.displayName });
    console.log(`User profile updated for UID: ${uid}`);
    return { success: true };
  }
);
