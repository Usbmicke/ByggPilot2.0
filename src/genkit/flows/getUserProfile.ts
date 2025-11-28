
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebaseAuth, AuthContext } from '@genkit-ai/firebase/auth';
import { z } from 'zod';
import { userRepo, UserProfile } from '../dal/user.repo';
import { auth } from '../firebase';

// ===================================================================
// Zod Schema for User Profile Output
// ===================================================================

const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string().optional(),
  onboardingCompleted: z.boolean(),
  createdAt: z.string().transform((str) => new Date(str).toISOString()),
});

// ===================================================================
// Security Policy (Auth Policy)
// ===================================================================

const authPolicy = async (context: AuthContext, input: z.infer<typeof UserProfileSchema>) => {
  if (!context.auth) {
    throw new Error('Authentication required.');
  }
  // En användare ska bara kunna hämta sin egen profil
  if (context.auth.uid !== input.uid) {
    throw new Error('You are not authorized to view this profile.');
  }
};

// ===================================================================
// Get User Profile Flow
// ===================================================================
// Hämtar profilen för den autentiserade användaren.
// ===================================================================

export const getUserProfileFlow = defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.object({ uid: z.string() }), // Kräver UID som input för säkerhetskontroll
    outputSchema: UserProfileSchema.nullable(),
    middleware: [firebaseAuth(auth, authPolicy)],
  },
  async (input, context) => {
    console.log(`[Get User Profile] Fetching profile for user: ${input.uid}`);

    const userProfile = await run('fetch-user-profile', () =>
      userRepo.get(input.uid)
    );

    if (!userProfile) {
      console.log(`[Get User Profile] Profile not found for user: ${input.uid}`);
      return null;
    }

    // Mappa till DTO
    const userProfileDto = {
      ...userProfile,
      createdAt: userProfile.createdAt.toISOString(),
    };

    return userProfileDto;
  }
);
