
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase';
import { getUserProfile } from '../dal/user.repo';

// Definiera ett schema för användarprofilen som matchar Firestore-datan
export const userProfileSchema = z.object({
  companyName: z.string().optional(),
  driveRootFolderId: z.string().optional(),
  logoUrl: z.string().optional(),
});

export const getUserProfileFlow = defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.void(),
    outputSchema: userProfileSchema.nullable(),
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        // I detta fallet vill vi kanske inte kasta ett fel, utan bara returnera null.
        // Beroende på säkerhetskrav.
        // För nu: kräv inloggning.
        throw new Error('Autentisering krävs för att hämta användarprofil.');
      }
    }),
  },
  async (input, { auth }) => {
    if (!auth) {
      // Detta bör teoretiskt sett aldrig hända pga authPolicy, men för typsäkerhet:
      return null;
    }
    const profile = await getUserProfile(auth.uid);
    return profile ? userProfileSchema.parse(profile) : null;
  }
);
