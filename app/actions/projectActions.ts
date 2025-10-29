
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { createProjectFolderStructure } from './driveActions';
import { projectSchema, type ProjectFormData } from '@/lib/schemas/project';
import { type Project, type File } from '@/lib/types';

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

    // Asynkront skapa mappstrukturen utan att blockera svaret
    createProjectFolderStructure(newProjectRef.id, validation.data.projectName).catch(console.error);

    return { status: 'success', message: 'Projekt skapat!' };
  } catch (error) {
    console.error('Fel vid skapande av projekt:', error);
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
    if (!session?.user?.id) { // Korrigerat från uid till id
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id; // Korrigerat från uid till id

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
        console.error('Fel vid tillägg av fil till projekt:', error);
        return { success: false, error: 'Ett serverfel uppstod när filen skulle läggas till i projektet.' };
    }
}
