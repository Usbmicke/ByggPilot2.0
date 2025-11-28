
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { userRepo } from '../dal/user.repo';
import { verifyIdToken } from '../auth/firebaseAdmin';

// ===================================================================
// Zod Schema for User Profile Output
// ===================================================================
const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().optional(), // Email might not always be present
  displayName: z.string().optional(),
  onboardingCompleted: z.boolean(),
  createdAt: z.string(), // Sent as ISO string
});

// ===================================================================
// Get User Profile Flow
// ===================================================================
// Hämtar profilen för den autentiserade användaren.
// Använder en auth-policy för att verifiera Firebase ID-token.
// ===================================================================
export const getUserProfile = defineFlow(
  {
    name: 'getUserProfile',
    inputSchema: z.void(), // No input needed from the client
    outputSchema: UserProfileSchema.nullable(),
    auth: {
      policy: async (auth, input) => {
        // Verify the token using our centralized admin utility
        const user = await verifyIdToken(auth.idToken!);
        // Pass the UID to the flow's context
        return {
          uid: user.uid
        };
      },
    },
  },
  async (_, context) => {
    // UID is now securely available from the auth context
    const userId = context.auth.uid;
    console.log(`[Get User Profile] Fetching profile for authenticated user: ${userId}`);

    const userProfile = await run('fetch-user-profile-from-repo', () =>
      userRepo.get(userId)
    );

    if (!userProfile) {
      console.log(`[Get User Profile] Profile not found for user: ${userId}`);
      return null;
    }

    // Map to the output schema (DTO)
    return {
      uid: userProfile.uid,
      email: userProfile.email,
      displayName: userProfile.displayName,
      onboardingCompleted: userProfile.onboardingCompleted,
      createdAt: userProfile.createdAt.toISOString(),
    };
  }
);
