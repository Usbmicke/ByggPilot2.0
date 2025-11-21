
import { auth, firestore as db } from '@/app/_lib/config/firebase-admin';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ====================================================================
// GULDSTANDARD: TYPER OCH SCHEMAN
// ====================================================================

export interface Session {
  userId: string;
  companyId: string;
}

const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  companyId: z.string(),
  createdAt: z.instanceof(Timestamp),
  onboardingStatus: z.enum(['incomplete', 'complete']),
  googleDriveRootFolderId: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
});

const ProjectSchema = z.object({
    projectId: z.string(),
    companyId: z.string(),
    name: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ====================================================================
// GULDSTANDARD: KÄRNSÄKERHETSFUNKTION (verifySession V3 - REN FUNKTION)
// ====================================================================
// Denna funktion är nu "ren". Den känner inte till cookies, bara värdet.
// Den tar emot en cookie-sträng och returnerar en verifierad session.
export async function verifySession(sessionCookie: string | undefined): Promise<Session> {
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie provided.');
  }

  const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
  const userRef = db.collection('users').doc(decodedToken.uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('Unauthorized: User profile not found.');
  }

  const profileData = doc.data();
  const validationResult = UserProfileSchema.safeParse(profileData);

  if (!validationResult.success || !validationResult.data.companyId) {
    console.error('Validation Error in verifySession:', validationResult.error);
    throw new Error('Unauthorized: Invalid user profile or missing companyId.');
  }

  return {
    userId: validationResult.data.userId,
    companyId: validationResult.data.companyId,
  };
}


// ====================================================================
//  DAL-funktioner anpassade till Guldstandarden
// ====================================================================
// Notera hur alla funktioner nu tar emot en 'session' som argument.
// De är frikopplade från ansvaret att verifiera sessionen själva.

export async function getMyProfile(session: Session): Promise<UserProfile | null> {
    const userRef: DocumentReference = db.collection('users').doc(session.userId);
    const doc = await userRef.get();
    if (!doc.exists) return null;
    return UserProfileSchema.parse(doc.data());
}

export async function getProjectForUser(session: Session, projectId: string): Promise<any> {
  const projectRef = db.collection('projects').doc(projectId);
  const doc = await projectRef.get();

  if (!doc.exists) {
    throw new Error('Not Found: Project does not exist.');
  }

  const projectData = doc.data();
  const validatedProject = ProjectSchema.parse(projectData);

  if (validatedProject.companyId !== session.companyId) {
    throw new Error("Forbidden: You do not have access to this project.");
  }

  return validatedProject;
}

export async function saveMyCompanyInfo(session: Session, companyName: string, companyAddress: string): Promise<void> {
  const userRef: DocumentReference = db.collection('users').doc(session.userId);
  await userRef.update({
    companyName: companyName,
    companyAddress: companyAddress,
  });
  const companyRef = db.collection('companies').doc(session.companyId);
  await companyRef.update({ name: companyName });
}

export async function completeMyOnboarding(session: Session, googleDriveRootFolderId: string): Promise<void> {
  const userRef: DocumentReference = db.collection('users').doc(session.userId);
  await userRef.update({
    onboardingStatus: 'complete',
    googleDriveRootFolderId: googleDriveRootFolderId,
  });
}

// ====================================================================
//  OFÖRÄNDRADE FUNKTIONER
// ====================================================================

export async function createCompanyAndLinkUser(userId: string, email: string, companyName: string): Promise<void> {
    const companyId = uuidv4();
    const userRef = db.collection('users').doc(userId);
    const companyRef = db.collection('companies').doc(companyId);
    const batch = db.batch();
    batch.set(companyRef, { 
        companyId: companyId,
        name: companyName,
        createdAt: Timestamp.now(),
    });
    batch.update(userRef, { companyId: companyId });
    await batch.commit();
}

export async function getUserProfileForMiddleware(userId: string): Promise<UserProfile | null> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) return null;
    const profileData = doc.data();
    const validationResult = UserProfileSchema.safeParse(profileData);
    return validationResult.success ? validationResult.data : null;
}
