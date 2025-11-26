
import { firestore } from "@/lib/config/firebase-admin";

const USERS_COLLECTION = 'users';

// Main User interface representing the document in Firestore
export interface User {
  uid: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: FirebaseFirestore.Timestamp;
  
  // Onboarding specific fields
  hasOnboarded: boolean;
  companyName?: string;
  logoUrl?: string;
}

/**
 * Finds a user by their unique ID from the Firestore database.
 * @param uid The user's unique ID.
 * @returns The user data object if found, otherwise null.
 */
export async function getUserById(uid: string): Promise<User | null> {
  const doc = await firestore.collection(USERS_COLLECTION).doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as User;
}

/**
 * Creates a new user profile during initial sign-up.
 * Sets `hasOnboarded` to `false` by default.
 * @param profileData The essential data for the new user.
 * @returns The newly created user object.
 */
export async function createUserProfile(profileData: { uid: string; email: string; name?: string; avatarUrl?: string; }): Promise<User> {
  const userRef = firestore.collection(USERS_COLLECTION).doc(profileData.uid);
  
  const newUser: User = {
    ...profileData,
    hasOnboarded: false, // Default value for new users
    createdAt: new Date(),
  };

  await userRef.set(newUser);
  return newUser;
}

/**
 * Updates a user's profile, typically after completing the onboarding process.
 * @param uid The user's unique ID.
 * @param dataToUpdate The onboarding data to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function completeOnboarding(uid: string, dataToUpdate: { companyName: string; logoUrl: string; }) {
  const userRef = firestore.collection(USERS_COLLECTION).doc(uid);
  
  await userRef.update({
    ...dataToUpdate,
    hasOnboarded: true,
  });
}
