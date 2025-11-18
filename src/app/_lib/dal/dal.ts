
// Data Access Layer (DAL) - Byggd enligt "Guldstandard"-blueprint (Del 2.2)
// Denna fil centraliserar all interaktion med Firestore.

import { getFirestore, Firestore, Timestamp, DocumentReference } from 'firebase-admin/firestore';

const db: Firestore = getFirestore();

// ====================================================================
// Scheman och Typer
// ====================================================================

export interface UserProfile {
  userId: string;
  email: string;
  createdAt: Timestamp;
  onboardingStatus: 'incomplete' | 'complete';
  googleDriveRootFolderId?: string; // Nytt, valfritt fält
}

export interface Project {
  projectId: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Timestamp;
}

export interface ActionableEvent {
    id: string;
    type: 'new_task' | 'invoice_due' | 'project_approved' | 'new_message' | 'log' | 'Tip';
    title: string;
    createdAt: Timestamp | Date;
    description?: string;
    message?: string;
    link?: string;
    isRead: boolean;
}

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
 * Slutför en användares onboarding.
 * @param {string} userId - Användarens ID.
 * @param {string} googleDriveRootFolderId - ID för användarens rotmapp i Google Drive.
 * @returns {Promise<void>}
 */
export async function completeUserOnboarding(userId: string, googleDriveRootFolderId: string): Promise<void> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    await userRef.update({ 
        onboardingStatus: 'complete',
        googleDriveRootFolderId: googleDriveRootFolderId 
    });
}

// ====================================================================
// CRUD-funktioner för Projekt
// ====================================================================

export async function verifyProjectAccess(projectId: string, userId: string): Promise<void> {
  const projectRef = db.collection('projects').doc(projectId);
  const doc = await projectRef.get();
  if (!doc.exists) {
    throw new Error(`Project with ID ${projectId} not found.`);
  }
  const project = doc.data() as Project;
  if (project.ownerId !== userId && !project.memberIds?.includes(userId)) {
    throw new Error(`User ${userId} does not have access to project ${projectId}.`);
  }
}

export async function createProject(data: { name: string, ownerId: string }): Promise<string> {
  const projectRef = db.collection('projects').doc();
  const newProject: Project = {
    projectId: projectRef.id,
    name: data.name,
    ownerId: data.ownerId,
    memberIds: [data.ownerId],
    createdAt: Timestamp.now(),
  };
  await projectRef.set(newProject);
  return projectRef.id;
}

// ====================================================================
// CRUD-funktioner för ÄTA och Offert (STUBS)
// ====================================================================

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
