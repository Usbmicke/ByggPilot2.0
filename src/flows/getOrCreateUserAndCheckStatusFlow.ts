
import { onCall } from 'genkitx-firebase/functions';
import { z } from 'zod';
import { adminDb, adminAuth } from '@/lib/config/firebase-admin';
import { defineFlow, run } from '@genkit-ai/flow';

export const getOrCreateUserAndCheckStatusFlow = defineFlow(
  {
    name: 'getOrCreateUserAndCheckStatusFlow',
    inputSchema: z.object({}), // Inga indata behövs, vi använder auth-context.
    outputSchema: z.object({ 
        onboardingComplete: z.boolean(),
        userId: z.string(),
    }),
    // Använd onCall för att göra detta till ett säkert, autentiserat flöde.
    middleware: [onCall({ region: 'europe-west1' })],
  },
  async (input, streamingCallback, context) => {

    // 1. Verifiera autentisering
    // Om anropet görs utan en giltig token kommer Genkit/Firebase att kasta ett fel automatiskt.
    if (!context.auth) {
      throw new Error('Anropet måste vara autentiserat med en giltig Firebase ID-token.');
    }

    const userId = context.auth.uid;
    console.log(`[Genkit Flow] Bearbetar för autentiserad användare: ${userId}`);

    // 2. Hämta användardokument från Firestore
    const userDocRef = adminDb.collection('users').doc(userId);
    let userDoc = await userDocRef.get();

    // 3. Om användaren inte finns, skapa den
    if (!userDoc.exists) {
      console.log(`[Genkit Flow] Användare ${userId} finns inte. Skapar nytt dokument.`);
      const firebaseUser = await adminAuth.getUser(userId);

      const newUser = {
        email: firebaseUser.email || 'N/A', // E-post kanske inte alltid finns
        displayName: firebaseUser.displayName || 'N/A',
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date().toISOString(),
        onboardingComplete: false, // Default-värde för nya användare
      };

      await userDocRef.set(newUser);
      console.log(`[Genkit Flow] Nytt användardokument skapat för ${userId}.`);
      userDoc = await userDocRef.get(); // Läs in det nyskapade dokumentet
    }

    // 4. Kontrollera och returnera onboarding-status
    const userData = userDoc.data();
    const onboardingComplete = userData?.onboardingComplete || false;
    console.log(`[Genkit Flow] Användare ${userId} har onboardingComplete: ${onboardingComplete}`);

    return {
      onboardingComplete,
      userId,
    };
  }
);
