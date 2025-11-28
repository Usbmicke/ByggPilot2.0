
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { z } from 'zod';
import { userRepo } from '../dal/user.repo';

export const getUserProfileFlow = defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.object({ userId: z.string() }),
    outputSchema: z.any(), // Helst ett Zod-schema för UserProfile
    middleware: [firebaseAuth()],
  },
  async (input, context) => {
    // Säkerställ att den inloggade användaren bara kan hämta sin egen profil
    if (context.auth?.uid !== input.userId) {
      throw new Error('Unauthorized access to user profile.');
    }

    const userProfile = await run('fetch-user-profile', () =>
      userRepo.get(input.userId)
    );

    if (!userProfile) {
      throw new Error('User profile not found.');
    }

    return userProfile;
  }
);
