
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

export interface Project {
  projectId: string;
  ownerId: string;      // The user who created the project
  memberIds: string[];  // List of user IDs with access
  // ... other project fields like name, address, etc.
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
 * Skapar en ny användarprofil i Firestore och returnerar den.
 * @param {Pick<UserProfile, 'userId' | 'email'>} data - Användardata.
 * @returns {Promise<UserProfile>} Den nyskapade användarprofilen.
 */
export async function createUserProfile(data: Pick<UserProfile, 'userId' | 'email'>): Promise<UserProfile> {
  const userRef: DocumentReference = db.collection('users').doc(data.userId);

  const newProfile: UserProfile = {
    userId: data.userId,
    email: data.email,
    createdAt: Timestamp.now(),
    onboardingStatus: 'incomplete', // Standardvärde för nya användare
  };

  // Använd en transaktion för att säkerställa atomicitet.
  await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      if (!doc.exists) {
          transaction.set(userRef, newProfile);
      }
  });

  // Returnera det nyskapade (eller befintliga) profilobjektet
  const doc = await userRef.get();
  return doc.data() as UserProfile;
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

// ====================================================================
// CRUD-funktioner för Projekt
// ====================================================================

/**
 * Verifies if a user has access to a specific project.
 * Throws an error if access is denied.
 * @param {string} projectId - The ID of the project to check.
 * @param {string} userId - The ID of the user to verify.
 * @returns {Promise<void>} Resolves if access is granted, otherwise throws an error.
 */
export async function verifyProjectAccess(projectId: string, userId: string): Promise<void> {
  const projectRef = db.collection('projects').doc(projectId);
  const doc = await projectRef.get();

  if (!doc.exists) {
    throw new Error(`Project with ID ${projectId} not found.`);
  }

  const project = doc.data() as Project;

  // Check if the user is the owner or a member of the project.
  if (project.ownerId !== userId && !project.memberIds?.includes(userId)) {
    throw new Error(`User ${userId} does not have access to project ${projectId}.`);
  }
}

// ====================================================================
// CRUD-funktioner för ÄTA och Offert (STUBS)
// ====================================================================
// These functions are imported in specialized-flows.ts but were missing.
// Adding them here as stubs.

export async function createAta(data: any): Promise<string> {
  const ref = db.collection('projects').doc(data.projectId).collection('atas').doc();
  await ref.set(data);
  return ref.id;
}

export async function createQuote(data: any): Promise<string> {
  const ref = db.collection('projects').doc(data.projectId).collection('quotes').doc();
  await ref.set(data);
  return ref.id;
}
