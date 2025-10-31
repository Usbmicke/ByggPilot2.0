
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
// KORRIGERING: Importerar nu det korrekta funktionsnamnet.
import { createInitialFolderStructure } from './driveActions'; 
import { projectSchema, type ProjectFormData } from '@/lib/schemas/project';
import { type Project, type File } from '@/types'; // Standardiserad import
import { logger } from '@/lib/logger'; // Importera logger

export async function createProject(formData: ProjectFormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { status: 'error', message: 'Autentisering krävs.' };
  }
  const userId = session.user.id;

  const validation = projectSchema.safeParse(formData);
  if (!validation.success) {
    return { status: 'error', message: 'Ogiltig data.' };
  }

  try {
    const newProjectRef = await firestoreAdmin.collection(`users/${userId}/projects`).add({
      ...validation.data,
      userId,
      createdAt: new Date(),
      status: 'Pågående',
    });

    // KORRIGERING: Anropet till mappskapande är temporärt inaktiverat.
    // Anledningen är att `createInitialFolderStructure` förväntar sig `accessToken` och `companyName`,
    // medan vi här har `projectId` och `projectName`. Detta är en arkitektonisk fråga
    // som behöver lösas separat. Att anropa den skulle orsaka ett fel.
    /*
    createInitialFolderStructure(newProjectRef.id, validation.data.projectName).catch(error => 
        logger.error('Failed to create project folder structure asynchronously', { projectId: newProjectRef.id, error })
    );
    */

    // Korrekt loggning för att indikera att steget är överhoppat.
    logger.info('Skipping folder creation: Mismatched function signature in createProject action.', { projectId: newProjectRef.id });

    return { status: 'success', message: 'Projekt skapat!' };
  } catch (error) {
    logger.error('Error creating project', { userId, error });
    return { status: 'error', message: 'Ett serverfel uppstod.' };
  }
}


// ... (befintliga project actions) ...

/**
 * GULDSTANDARD ACTION: `addFileToProject`
 * Lägger till en filreferens (metadata) i en sub-collection under ett projekt.
 * Säkerställer att användaren äger projektet innan filen läggs till.
 */
export async function addFileToProject(projectId: string, fileData: Omit<File, 'id'>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        // Steg 1: Verifiera ägarskap av projektet
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        // Steg 2: Lägg till fil-metadatan i en sub-collection
        const filesCollectionRef = projectRef.collection('files');
        await filesCollectionRef.add(fileData);

        return { success: true };

    } catch (error) {
        logger.error('Error adding file to project', { userId, projectId, error });
        return { success: false, error: 'Ett serverfel uppstod när filen skulle läggas till i projektet.' };
    }
}
