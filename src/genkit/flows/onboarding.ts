
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { userRepo } from '@/genkit-dal/user.repo';
import { firebaseAuth } from '@genkit-ai/firebase/auth';

// ===================================================================
// GET USER PROFILE FLOW (Read Operation)
// ===================================================================

export const getUserProfile = defineFlow(
  {
    name: 'getUserProfile',
    inputSchema: z.object({ userId: z.string() }),
    outputSchema: z.object({
      uid: z.string(),
      email: z.string(),
      displayName: z.string().optional(),
      onboardingCompleted: z.boolean(),
    }).nullable(),
    authPolicy: firebaseAuth((user) => {
      if (!user) throw new Error("Authentication is required.");
    }),
  },
  async ({ userId }) => {
    return await userRepo.get(userId);
  }
);

// ===================================================================
// ONBOARDING FLOW (Write/Update Operation)
// ===================================================================

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: z.object({ displayName: z.string().min(2) }),
    outputSchema: z.object({ success: z.boolean() }),
    authPolicy: firebaseAuth((user) => {
      if (!user?.uid) {
        throw new Error("A fully authenticated user is required.");
      }
    }),
  },
  async (input, { auth }) => {
    const userId = auth.uid!;
    console.log(`Starting onboarding for user: ${userId}`);

    // KORREKT LOGIK: Uppdatera den befintliga användaren, skapa inte en ny.
    await userRepo.update(userId, {
      displayName: input.displayName,
      onboardingCompleted: true, // Sätt flaggan till true!
    });

    console.log(`Successfully completed onboarding for user: ${userId}`);

    return { success: true };
  }
);
