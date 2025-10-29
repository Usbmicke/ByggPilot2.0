
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { UserProfile } from '@/app/types';

/**
 * Fetches a user's complete profile from Firestore by their ID.
 * @param userId The user's Firestore document ID.
 * @returns The user's profile data, or null if not found.
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await firestoreAdmin.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.warn(`[DAL] User document with ID ${userId} not found.`);
      return null;
    }

    const userData = userDoc.data() as UserProfile;
    return {
      ...userData,
      id: userDoc.id,
    };
  } catch (error) {
    console.error(`[DAL] Error fetching user by ID ${userId}:`, error);
    throw new Error('Failed to fetch user from database.');
  }
}
