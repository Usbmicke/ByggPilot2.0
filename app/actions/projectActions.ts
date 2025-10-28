
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions';
import { db } from '@/app/lib/firebase/firestore';
import { collection, addDoc, getDocs, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createProjectFolderStructure } from './driveActions';
import { Project, File } from '@/app/types';
import { projectSchema, type ProjectFormData } from '@/lib/schemas/project';

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
    const newProjectRef = await addDoc(collection(db, `users/${userId}/projects`), {
      ...validation.data,
      userId,
      createdAt: serverTimestamp(),
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
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        // Steg 2: Lägg till fil-metadatan i en sub-collection
        const filesCollectionRef = collection(projectRef, 'files');
        await addDoc(filesCollectionRef, fileData);

        return { success: true };

    } catch (error) {
        console.error('Fel vid tillägg av fil till projekt:', error);
        return { success: false, error: 'Ett serverfel uppstod när filen skulle läggas till i projektet.' };
    }
}
