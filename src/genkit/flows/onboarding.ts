
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebaseAuth, AuthContext } from '@genkit-ai/firebase/auth';
import { z } from 'zod';
import { userRepo } from '../dal/user.repo';
import { projectRepo } from '../dal/project.repo';
import { auth } from '../firebase';

// ===================================================================
// Security Policy (Auth Policy)
// ===================================================================
// Denna policy säkerställer att endast en autentiserad användare kan
// anropa detta flöde. Genkit verifierar automatiskt Firebase ID-token.
// ===================================================================

const authPolicy = async (context: AuthContext, input: any) => {
  if (!context.auth) {
    throw new Error('Authentication required.');
  }
};

// ===================================================================
// Onboarding Flow
// ===================================================================
// Detta flöde är det enskilt viktigaste steget för en ny användare.
// Det är en skriv-operation (mutation) som gör två saker:
// 1. Uppdaterar användarens profil med visningsnamn och slutförd onboarding.
// 2. Skapar de grundläggande projektmapparna för användaren.
// ===================================================================

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: z.object({ displayName: z.string().min(2) }),
    outputSchema: z.object({ success: z.boolean() }),
    middleware: [firebaseAuth(auth, authPolicy)],
  },
  async (input, context) => {
    const userId = context.auth!.uid;
    console.log(`[Onboarding Flow] Starting for user: ${userId}`);

    // Steg 1: Uppdatera användarprofilen
    await run('update-user-profile', () =>
      userRepo.update(userId, {
        displayName: input.displayName,
        onboardingCompleted: true,
      })
    );
    console.log(`[Onboarding Flow] Step 1/2: User profile updated.`);

    // Steg 2: Skapa standardmappar (idempotent)
    await run('create-default-folders', () =>
      projectRepo.createDefaultFolders(userId)
    );
    console.log(`[Onboarding Flow] Step 2/2: Default folders ensured.`);

    console.log(`[Onboarding Flow] Successfully completed for user: ${userId}`);
    return { success: true };
  }
);
