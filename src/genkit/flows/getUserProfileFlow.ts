import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase';
import { getUserProfile } from '../dal/user.repo';

// Definiera ett schema för användarprofilen som matchar Firestore-datan
const UserProfileSchema = z.object({
  companyName: z.string().optional(),
  logoUrl: z.string().url().optional(),
  driveRootFolderId: z.string().optional(),
  // Lägg till andra fält från din användarprofil vid behov
}).nullable();

export const getUserProfileFlow = defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.void(), // Inget input behövs
    outputSchema: UserProfileSchema,
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error('Autentisering krävs för att hämta användarprofil.');
      }
    }),
  },
  async (_, { auth }) => {
    // auth-objektet är garanterat att finnas här tack vare authPolicy
    const profile = await getUserProfile(auth.uid);

    // Validera att datan från Firestore matchar vårt schema
    const validation = UserProfileSchema.safeParse(profile);
    if (validation.success) {
      return validation.data;
    } else {
      console.error("Valideringsfel för användarprofil:", validation.error);
      // Returnera null om datan är oväntad för att undvika fel på klientsidan
      return null;
    }
  }
);
