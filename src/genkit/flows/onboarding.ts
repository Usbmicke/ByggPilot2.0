
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { z } from 'zod';
// KORREKT SÖKVÄG till dal-mappen
import { userRepo } from '../dal/user.repo';

// ===================================================================
// ONBOARDING FLOW (Write/Update Operation)
// ===================================================================

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: z.object({ displayName: z.string().min(2) }),
    outputSchema: z.object({ success: z.boolean() }),
    // ANVÄND MIDDLEWARE för enklare och mer standardiserad auth
    middleware: [firebaseAuth()],
  },
  async (input, context) => {
    // context.auth är nu garanterat att finnas tack vare middleware
    const userId = context.auth!.uid;
    console.log(`Starting onboarding for user: ${userId}`);

    await run('complete-onboarding', () => 
      userRepo.update(userId, {
        displayName: input.displayName,
        onboardingCompleted: true,
      })
    );

    console.log(`Successfully completed onboarding for user: ${userId}`);

    return { success: true };
  }
);
