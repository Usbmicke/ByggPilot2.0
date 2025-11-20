
import { cookies } from 'next/headers';
import { auth, firestore as db } from '@/app/_lib/config/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

// ====================================================================
// Zod Schemas för Datavalidering
// ====================================================================

const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  createdAt: z.instanceof(Timestamp),
  onboardingStatus: z.enum(['incomplete', 'complete']),
  googleDriveRootFolderId: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ====================================================================
// Kärnsäkerhetsfunktion
// ====================================================================

async function verifySession(): Promise<DecodedIdToken> {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    throw new Error('Session-cookie saknas. Användaren är inte autentiserad.');
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    console.error('Ogiltig session-cookie:', error);
    throw new Error('Ogiltig session. Vänligen logga in igen.');
  }
}

// ====================================================================
// Säkra CRUD-funktioner för Användare
// ====================================================================

export async function getMyProfile(): Promise<UserProfile | null> {
  const decodedToken = await verifySession();
  const userId = decodedToken.uid;

  const userRef: DocumentReference = db.collection('users').doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    console.warn(`Profil saknas för validerad användare: ${userId}`);
    return null;
  }
  
  const profileData = doc.data();
  
  const validationResult = UserProfileSchema.safeParse(profileData);
  if (!validationResult.success) {
      console.error('Valideringsfel i getMyProfile:', validationResult.error);
      throw new Error('Felaktig data i användarprofil.');
  }

  return validationResult.data;
}

/**
 * SPECIALFUNKTION ENDAST FÖR MIDDLEWARE.
 * Denna funktion tar emot en userId eftersom middlewaren redan har verifierat sessionen.
 * Använd getMyProfile() i alla andra sammanhang.
 */
export async function getUserProfileForMiddleware(userId: string): Promise<UserProfile | null> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
        return null;
    }

    const profileData = doc.data();
    const validationResult = UserProfileSchema.safeParse(profileData);
    if (!validationResult.success) {
        console.error('Valideringsfel i getUserProfileForMiddleware:', validationResult.error);
        // Kasta inte ett fel här, middlewaren bör hantera detta gracefully
        return null; 
    }

    return validationResult.data;
}

export async function saveMyCompanyInfo(companyName: string, companyAddress: string): Promise<void> {
  const decodedToken = await verifySession();
  const userId = decodedToken.uid;

  const userRef: DocumentReference = db.collection('users').doc(userId);
  await userRef.update({
    companyName: companyName,
    companyAddress: companyAddress,
  });
}

export async function getMyCompanyName(): Promise<string | null> {
  const profile = await getMyProfile();
  return profile?.companyName || null;
}

export async function completeMyOnboarding(googleDriveRootFolderId: string): Promise<void> {
  const decodedToken = await verifySession();
  const userId = decodedToken.uid;

  const userRef: DocumentReference = db.collection('users').doc(userId);
  await userRef.update({
    onboardingStatus: 'complete',
    googleDriveRootFolderId: googleDriveRootFolderId,
  });
}
