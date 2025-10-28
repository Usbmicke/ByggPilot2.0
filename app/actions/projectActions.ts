
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/firebase/firestore';
import { collection, addDoc, getDocs, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createProjectFolderStructure } from './driveActions';
import { Project, File } from '@/app/types/index';

// ... (befintliga project actions) ...

/**
 * GULDSTANDARD ACTION: `addFileToProject`
 * Lägger till en filreferens (metadata) i en sub-collection under ett projekt.
 * Säkerställer att användaren äger projektet innan filen läggs till.
 */
export async function addFileToProject(projectId: string, fileData: Omit<File, 'id'>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.uid;

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
