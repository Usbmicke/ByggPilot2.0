
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { userRepo } from '@/genkit/dal/user.repo';
// KORREKT IMPORT FRÅN DET NYA PAKETET
import { firebaseAuth } from '@genkit-ai/firebase/auth'; 

// ===================================================================
// GET USER PROFILE FLOW (Read Operation)
// ===================================================================

export const getUserProfile = defineFlow(
  {
    name: 'getUserProfile', // Detta namn används som `flowId` i klienten
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
    console.log(`Fetching profile for user: ${userId}`);
    return await userRepo.get(userId);
  }
);

// ===================================================================
// ONBOARDING FLOW (Write Operation)
// ===================================================================

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow', // Detta namn används som `flowId` i klienten
    inputSchema: z.object({ displayName: z.string().min(2) }),
    outputSchema: z.object({
      success: z.boolean(),
      userId: z.string(),
    }),
    authPolicy: firebaseAuth((user) => {
      if (!user?.uid || !user.email) {
        throw new Error("A fully authenticated user is required.");
      }
    }),
  },
  async (input, { auth }) => {
    console.log(`Starting onboarding for user: ${auth.uid}`);

    await userRepo.create({
      uid: auth.uid!,
      email: auth.email!,
      displayName: input.displayName,
      onboardingCompleted: true,
    });

    console.log(`Successfully created profile for user: ${auth.uid}`);

    return {
      success: true,
      userId: auth.uid!,
    };
  }
);
