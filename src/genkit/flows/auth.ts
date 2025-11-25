import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { createUserProfile, getUserById } from '@/lib/dal/repositories/user.repo';

// This is the main authentication flow. When called from the frontend with a valid
// Firebase ID token, Genkit's `firebaseAuth` policy will automatically validate it
// and create a secure, HttpOnly session cookie, which is then used for all
// subsequent requests to protected flows.
export const userSessionLogin = defineFlow({
  name: 'userSessionLogin',
  inputSchema: z.object({}), // No input needed, token is in the header
  authPolicy: firebaseAuth(async (user) => {
    // This block runs AFTER the token is successfully verified.
    // Here, we can add logic like creating a user profile on first login.
    const existingUser = await getUserById(user.uid);

    if (!existingUser) {
      console.log(`First time login for user ${user.uid}, creating profile.`);
      await runFlow(createUserProfileFlow, { 
        uid: user.uid, 
        email: user.email!, 
        name: user.name, 
        avatarUrl: user.picture 
      });
    }
  }),
}, async () => {
  // If we get here, the token was valid and the session cookie is set.
  return { success: true, message: "Session cookie created successfully." };
});

// A separate flow for creating a user profile to keep logic clean.
const createUserProfileFlow = defineFlow({
  name: 'createUserProfileFlow',
  inputSchema: z.object({
    uid: z.string(),
    email: z.string(),
    name: z.string().optional(),
    avatarUrl: z.string().url().optional(),
  }),
}, async (profileData) => {
  return await createUserProfile(profileData);
});
