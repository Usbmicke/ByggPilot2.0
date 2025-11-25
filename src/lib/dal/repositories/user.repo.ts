
import { firestoreDb } from "@/lib/config/firebase-admin";

// This is the production-ready Data Access Layer (DAL) for users.
// It interacts directly with Firestore via the initialized admin SDK.

const USERS_COLLECTION = 'users';

interface User {
  uid: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: FirebaseFirestore.FieldValue;
}

/**
 * Finds a user by their unique ID from the Firestore database.
 * @param uid The user's unique ID.
 * @returns The user data object if found, otherwise null.
 */
export async function getUserById(uid: string): Promise<any | null> {
  console.log(`[DAL] Searching for user with UID: ${uid} in Firestore.`);
  try {
    const userRef = firestoreDb.collection(USERS_COLLECTION).doc(uid);
    const doc = await userRef.get();

    if (doc.exists) {
      console.log(`[DAL] User found in Firestore:`, doc.data());
      return doc.data();
    }

    console.log(`[DAL] User not found in Firestore.`);
    return null;
  } catch (error) {
    console.error(`[DAL] Error fetching user by ID: ${uid}`, error);
    throw new Error('Failed to get user from database.');
  }
}

/**
 * Creates a new user profile in the Firestore database.
 * @param profileData The data for the new user profile.
 * @returns The newly created user object.
 */
export async function createUserProfile(profileData: { uid: string; email: string; name?: string; avatarUrl?: string; }): Promise<any> {
  console.log(`[DAL] Creating new user in Firestore with data:`, profileData);
  try {
    const userRef = firestoreDb.collection(USERS_COLLECTION).doc(profileData.uid);
    
    const newUser = {
      ...profileData,
      createdAt: new Date(),
    };

    await userRef.set(newUser);
    console.log(`[DAL] User created successfully in Firestore.`);
    return newUser;
  } catch (error) {
    console.error(`[DAL] Error creating user profile:`, error);
    throw new Error('Failed to create user profile in database.');
  }
}
