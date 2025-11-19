
import { firestore as db } from '@/app/_lib/config/firebase-admin';
import { Timestamp, DocumentReference } from 'firebase-admin/firestore';

// ====================================================================
// Scheman och Typer
// ====================================================================

export interface UserProfile {
  userId: string;
  email: string;
  createdAt: Timestamp;
  onboardingStatus: 'incomplete' | 'complete';
  googleDriveRootFolderId?: string;
  companyName?: string;
  companyAddress?: string;
}

// ... (Övriga interfaces förblir desamma)

// ====================================================================
// CRUD-funktioner för Användare
// ====================================================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef: DocumentReference = db.collection('users').doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
}

/**
 * NY FUNKTION: Sparar företagsinformation under onboarding.
 */
export async function saveCompanyInfo(userId: string, companyName: string, companyAddress: string): Promise<void> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    await userRef.update({ 
        companyName: companyName,
        companyAddress: companyAddress 
    });
}

/**
 * NY FUNKTION: Hämtar enbart företagsnamnet för en användare.
 */
export async function getCompanyName(userId: string): Promise<string | null> {
    const userProfile = await getUserProfile(userId);
    return userProfile?.companyName || null;
}


export async function completeUserOnboarding(userId: string, googleDriveRootFolderId: string): Promise<void> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    await userRef.update({ 
        onboardingStatus: 'complete',
        googleDriveRootFolderId: googleDriveRootFolderId 
    });
}

// ... (Resten av CRUD-funktionerna förblir desamma)

