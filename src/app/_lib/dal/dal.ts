
import { cookies } from 'next/headers';
import { auth, firestore as db } from '@/app/_lib/config/firebase-admin';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ====================================================================
// GULDSTANDARD: TYPER OCH SCHEMAN
// ====================================================================

// Det berikade sessionsobjektet. Detta är resultatet av en lyckad verifiering.
export interface Session {
  userId: string;
  companyId: string;
}

const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  companyId: z.string(), // OBLIGATORISKT FÄLT FÖR SÄKERHET
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
    // ... andra projektfält
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ====================================================================
// GULDSTANDARD: KÄRNSÄKERHETSFUNKTION (verifySession V2)
// ====================================================================

async function verifySessionAndGetCompanyId(): Promise<Session> {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie.');
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    throw new Error('Unauthorized: Invalid session cookie.');
  }

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
// Exempel på Guldstandard DAL-funktion med radnivå-säkerhet
// ====================================================================

export async function getProjectForUser(projectId: string): Promise<any> {
  // 1. Verifiera session och hämta companyId
  const session = await verifySessionAndGetCompanyId();

  // 2. Hämta data
  const projectRef = db.collection('projects').doc(projectId);
  const doc = await projectRef.get();

  if (!doc.exists) {
    throw new Error('Not Found: Project does not exist.');
  }

  const projectData = doc.data();
  const validatedProject = ProjectSchema.parse(projectData);

  // 3. Verifiera behörighet (Row Level Security i kod)
  if (validatedProject.companyId !== session.companyId) {
    throw new Error("Forbidden: You do not have access to this project.");
  }

  return validatedProject;
}

// ====================================================================
//  Modifierade/Existerande funktioner anpassade till Guldstandarden
// ====================================================================

export async function getMyProfile(): Promise<UserProfile | null> {
    const session = await verifySessionAndGetCompanyId(); // Använder nya säkra funktionen
    const userRef: DocumentReference = db.collection('users').doc(session.userId);
    const doc = await userRef.get();
    if (!doc.exists) return null;
    return UserProfileSchema.parse(doc.data());
}

export async function createCompanyAndLinkUser(userId: string, email: string, companyName: string): Promise<void> {
    const companyId = uuidv4();
    const userRef = db.collection('users').doc(userId);

    const companyRef = db.collection('companies').doc(companyId);

    const batch = db.batch();

    // Skapa företag
    batch.set(companyRef, { 
        companyId: companyId,
        name: companyName,
        createdAt: Timestamp.now(),
    });

    // Uppdatera användarprofilen med companyId
    batch.update(userRef, { companyId: companyId });

    await batch.commit();
}


/**
 * SPECIALFUNKTION ENDAST FÖR MIDDLEWARE.
 */
export async function getUserProfileForMiddleware(userId: string): Promise<UserProfile | null> {
    const userRef: DocumentReference = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
        return null;
    }

    const profileData = doc.data();
    // Använder safeParse för att inte krascha middlewaren
    const validationResult = UserProfileSchema.safeParse(profileData);
    return validationResult.success ? validationResult.data : null;
}

export async function saveMyCompanyInfo(companyName: string, companyAddress: string): Promise<void> {
  const session = await verifySessionAndGetCompanyId();
  const userRef: DocumentReference = db.collection('users').doc(session.userId);
  await userRef.update({
    companyName: companyName,
    companyAddress: companyAddress,
  });
  // Uppdatera även företagsdokumentet
  const companyRef = db.collection('companies').doc(session.companyId);
  await companyRef.update({ name: companyName });
}

export async function completeMyOnboarding(googleDriveRootFolderId: string): Promise<void> {
  const session = await verifySessionAndGetCompanyId();
  const userRef: DocumentReference = db.collection('users').doc(session.userId);
  await userRef.update({
    onboardingStatus: 'complete',
    googleDriveRootFolderId: googleDriveRootFolderId,
  });
}
