
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
  createdAt: z.string(), // Skickas som ISO-sträng
});

// ===================================================================
// Security Policy (Auth Policy)
// ===================================================================
// Denna policy säkerställer att ENDAST en autentiserad användare kan
// anropa detta flöde. Ingen input behövs.
// ===================================================================
const authPolicy = async (context: AuthContext) => {
  if (!context.auth) {
    throw new Error('Authentication required to fetch user profile.');
  }
};

// ===================================================================
// Get User Profile Flow (FIXED)
// ===================================================================
// Hämtar profilen för den **autentiserade** användaren.
// Input-schemat är z.void() eftersom flödet alltid agerar på den
// inloggade användaren som identifieras via Bearer Token.
// ===================================================================
export const getUserProfileFlow = defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.void(), // Inget input behövs från klienten
    outputSchema: UserProfileSchema.nullable(),
    middleware: [firebaseAuth(auth, authPolicy)],
  },
  async (_, context) => {
    // UID hämtas säkert från kontexten efter att middleware har validerat token.
    const userId = context.auth!.uid; 
    console.log(`[Get User Profile] Fetching profile for authenticated user: ${userId}`);

    const userProfile = await run('fetch-user-profile', () =>
      userRepo.get(userId)
    );

    if (!userProfile) {
      console.log(`[Get User Profile] Profile not found for user: ${userId}`);
      return null;
    }

    // Mappa till DTO
    return {
      ...userProfile,
      createdAt: userProfile.createdAt.toISOString(),
    };
  }
);
