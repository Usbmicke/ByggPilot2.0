
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth'; // Korrigerad import
import { getUserProfile } from '../dal/user.repo';

// Definiera ett schema för användarprofilen som matchar Firestore-datan
export const UserProfileSchema = z.object({
  companyName: z.string().optional(),
  driveRootFolderId: z.string().optional(),
  logoUrl: z.string().optional(),
});

export const getUserProfileFlow = defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.void(),
    outputSchema: UserProfileSchema.nullable(),
    auth: firebaseAuth((user) => {
      if (!user) throw new Error('Authentication is required.');
    }),
  },
  async (uid) => {
    // Hämta UID från firebaseAuth-policyn
    return await getUserProfile(uid);
  }
);
