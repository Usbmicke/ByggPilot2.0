
// Data Access Layer (DAL) - Byggd enligt "Guldstandard"-blueprint (Del 2.2)
// Denna fil centraliserar all interaktion med Firestore.

import { getFirestore, Firestore, Timestamp, DocumentReference, DocumentData } from 'firebase-admin/firestore';

const db: Firestore = getFirestore();

// ====================================================================
// Scheman och Typer
// ====================================================================

export interface UserProfile {
  userId: string;
  email: string;
  createdAt: Timestamp;
  onboardingStatus: 'incomplete' | 'complete';
  // Lägg till andra fält som du vill spara, t.ex. companyId, settings, etc.
}

// ====================================================================
// CRUD-funktioner för Användare
// ====================================================================

/**
 * Hämtar en användarprofil från Firestore.
 * @param {string} userId - Användarens unika ID.
 * @returns {Promise<UserProfile | null>} Användarprofilen eller null om den inte finns.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef: DocumentReference = db.collection('users').doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as UserProfile;
}

/**
 * Skapar en ny användarprofil i Firestore.
 * Denna funktion är designad för att vara idempotent - den skriver bara om användaren inte redan finns.
 * @param {Pick<UserProfile, 'userId' | 'email'>} data - Användardata.
 * @returns {Promise<void>}
 */
export async function createUserProfile(data: Pick<UserProfile, 'userId' | 'email'>): Promise<void> {
  const userRef: DocumentReference = db.collection('users').doc(data.userId);

  const newProfile: UserProfile = {
    userId: data.userId,
    email: data.email,
    createdAt: Timestamp.now(),
    onboardingStatus: 'incomplete', // Standardvärde för nya användare
  };

  // Använd en transaktion för att säkerställa atomicitet.
  // Skapa bara om dokumentet inte redan finns.
  await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      if (!doc.exists) {
          transaction.set(userRef, newProfile);
      }
  });
}

/**
 * Uppdaterar onboarding-status för en användare.
 * @param {string} userId - Användarens ID.
 * @param {'incomplete' | 'complete'} status - Den nya statusen.
 * @returns {Promise<void>}
 */
export async function updateUserOnboardingStatus(userId: string, status: 'incomplete' | 'complete'): Promise<void> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    await userRef.update({ onboardingStatus: status });
}


// Exempel på andra DAL-funktioner du kan behöva:
// export async function getCompany(companyId: string) { ... }
// export async function createProject(data: ProjectData) { ... }
// export async function listProjectsForUser(userId: string) { ... }
