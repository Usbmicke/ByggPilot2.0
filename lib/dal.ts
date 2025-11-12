
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { UserProfile, UserProfileSchema } from './schemas';

// =================================================================================
// INITIALISERA FIREBASE ADMIN SDK
// =================================================================================

if (!getApps().length) {
  initializeApp();
}

const db: Firestore = getFirestore();
const usersCollection = db.collection('users');

// =================================================================================
// DATA ACCESS LAYER (DAL) - ANVÄNDARPROFILER
// =================================================================================

/**
 * Hämtar en användarprofil från Firestore.
 * @param userId Användarens unika ID (från Firebase Auth).
 * @returns Användarprofilen eller null om den inte finns.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDoc = await usersCollection.doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }
  const userData = userDoc.data();
  const validation = UserProfileSchema.safeParse(userData);
  if (!validation.success) {
    console.error('Ogiltig användardata i Firestore:', validation.error);
    return null;
  }
  return validation.data as UserProfile;
}

/**
 * Skapar en ny användarprofil i Firestore.
 * @param userId Användarens unika ID.
 * @param profileData Grundläggande data för profilen (e-post, namn, fotolänk).
 * @returns Den nyskapade användarprofilen.
 */
export async function createUserProfile(userId: string, profileData: { email: string; displayName?: string; photoURL?: string }): Promise<UserProfile> {
  const newUserProfile: UserProfile = {
    userId,
    email: profileData.email,
    displayName: profileData.displayName || '',
    photoURL: profileData.photoURL || '',
    onboardingComplete: false,
  };

  const validatedProfile = UserProfileSchema.parse(newUserProfile);
  await usersCollection.doc(userId).set(validatedProfile);
  return validatedProfile;
}

/**
 * Uppdaterar en befintlig användarprofil i Firestore.
 * @param userId Användarens unika ID.
 * @param data De fält som ska uppdateras.
 * @returns Den uppdaterade användarprofilen.
 */
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const userRef = usersCollection.doc(userId);
  const updateData = { ...data };
  delete updateData.userId; // Förhindra ändring av primärnyckel

  await userRef.update(updateData);

  const updatedDoc = await userRef.get();
  const updatedProfile = UserProfileSchema.parse(updatedDoc.data());
  return updatedProfile;
}
