import { db } from '@/lib/dal/firebase-admin';
import { CreateUserProfileSchema, UserSchema } from '@/lib/dal/dto/user.dto.ts';
import { z } from 'zod';

const usersCollection = db.collection('users');

/**
 * Creates a new user profile in Firestore.
 * Validates input against a Zod schema.
 * @param profileData - The data for the new user profile.
 * @returns The ID of the newly created user.
 */
export const createUserProfile = async (profileData: z.infer<typeof CreateUserProfileSchema>) => {
  const validatedData = CreateUserProfileSchema.parse(profileData);
  const { uid, ...data } = validatedData;

  await usersCollection.doc(uid).set({
   ...data,
    createdAt: new Date(),
  });

  return uid;
};

/**
 * Fetches a user by their ID.
 * @param uid - The user's unique ID.
 * @returns The user object or null if not found.
 */
export const getUserById = async (uid: string) => {
  const doc = await usersCollection.doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  // Validate the data from Firestore before returning it
  return UserSchema.parse({ id: doc.id, ...data });
};
