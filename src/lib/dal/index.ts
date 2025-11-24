
import { auth, firestore as db } from '@/lib/firebase/admin';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { DecodedIdToken } from 'firebase-admin/auth';

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
  companyLogoUrl: z.string().url().optional(),
});

const ProjectSchema = z.object({
    projectId: z.string(),
    companyId: z.string(),
    name: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ====================================================================
// NY FUNKTION: HÄMTA ELLER SKAPA ANVÄNDARE
// ====================================================================
export async function getOrCreateUserFromToken(decodedToken: DecodedIdToken): Promise<UserProfile> {
  const userRef = db.collection('users').doc(decodedToken.uid);
  const doc = await userRef.get();

  if (doc.exists) {
    const profile = UserProfileSchema.parse(doc.data());
    return profile;
  } else {
    console.log(`[DAL] Skapar ny användarprofil för UID: ${decodedToken.uid}`);
    const newCompanyId = uuidv4();
    const newUserProfile: UserProfile = {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      companyId: newCompanyId,
      createdAt: Timestamp.now(),
      onboardingStatus: 'incomplete',
    };

    const companyRef = db.collection('companies').doc(newCompanyId);
    const batch = db.batch();
    batch.set(userRef, newUserProfile);
    batch.set(companyRef, {
      companyId: newCompanyId,
      name: 'Nytt Företag',
      createdAt: Timestamp.now(),
    });
    await batch.commit();
    return newUserProfile;
  }
}

// ====================================================================
//  DAL-funktioner anpassade till Guldstandarden
// ====================================================================

export async function getMyProfile(session: Session): Promise<UserProfile | null> {
    const userRef: DocumentReference = db.collection('users').doc(session.userId);
    const doc = await userRef.get();
    if (!doc.exists) return null;
    return UserProfileSchema.parse(doc.data());
}

// UPPDATERAD FUNKTION
export async function saveMyCompanyInfo(
  session: Session, 
  companyName: string, 
  companyAddress: string, 
  companyLogoUrl?: string
): Promise<void> {
  const userRef: DocumentReference = db.collection('users').doc(session.userId);
  const companyRef = db.collection('companies').doc(session.companyId);

  const userDataToUpdate: { [key: string]: any } = {
    companyName: companyName,
    companyAddress: companyAddress,
  };

  if (companyLogoUrl) {
    userDataToUpdate.companyLogoUrl = companyLogoUrl;
  }

  const batch = db.batch();
  batch.update(userRef, userDataToUpdate);
  batch.update(companyRef, { name: companyName });

  await batch.commit();
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
