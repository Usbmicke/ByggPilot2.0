
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { getUserProfile, createUserProfile } from '../../lib/dal';

/**
 * Ett säkert Genkit-flöde som hämtar en användares profil eller skapar en ny om den inte finns.
 * Det kontrollerar också om användaren har slutfört onboarding-processen.
 * Kräver en autentiserad användare för att köras.
 */
export const getOrCreateUserAndCheckStatusFlow = defineFlow(
  {
    name: 'getOrCreateUserAndCheckStatusFlow',
    inputSchema: z.void(), // Inget input behövs från klienten
    outputSchema: z.object({
      userId: z.string(),
      email: z.string().email(),
      onboardingComplete: z.boolean(),
    }),
    authPolicy: (auth, input) => {
      if (!auth) {
        throw new Error('Autentisering krävs för detta flöde.');
      }
    },
  },
  async (input, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      // Detta bör teoretiskt sett aldrig hända pga authPolicy, men är en extra säkerhetsåtgärd.
      throw new Error('Användar-ID saknas i autentiseringskontexten.');
    }

    // Försök hämta befintlig profil
    let userProfile = await getUserProfile(uid);

    // Om profilen inte finns, skapa en ny
    if (!userProfile) {
      const email = context.auth?.email;
      if (!email) {
        throw new Error('E-post saknas i token för ny användare.');
      }
      console.log(`[AuthFlow] Skapar ny användarprofil för UID: ${uid}`);
      userProfile = await createUserProfile(uid, { 
        email,
        displayName: context.auth?.displayName || '',
        photoURL: context.auth?.photoURL || '' 
      });
    }

    console.log(`[AuthFlow] Returnerar status för UID: ${uid}. Onboarded: ${userProfile.onboardingComplete}`);
    
    return {
      userId: userProfile.userId,
      email: userProfile.email,
      onboardingComplete: userProfile.onboardingComplete,
    };
  }
);
