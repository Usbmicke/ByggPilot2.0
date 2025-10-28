
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/firebase/firestore';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { TimeEntry } from '@/app/types/index';

/**
 * Verifies that the currently authenticated user owns a specific project.
 * @param userId The ID of the authenticated user.
 * @param projectId The ID of the project to verify.
 * @returns {Promise<boolean>} True if the user owns the project, false otherwise.
 */
async function verifyProjectOwnership(userId: string, projectId: string): Promise<boolean> {
    try {
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        return projectSnap.exists(); // If the document exists in the user's subcollection, they own it.
    } catch (error) {
        console.error('Error verifying project ownership:', error);
        return false;
    }
}

/**
 * GULDSTANDARD ACTION: `createTimeEntry`
 * Skapar en ny tidrapport för ett specifikt projekt.
 * Säkerställer att användaren äger projektet innan rapporten skapas.
 */
export async function createTimeEntry(entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'userId'>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.uid;

    try {
        // Steg 1: Validera indata
        if (!entryData.projectId || !entryData.date || !entryData.hours) {
            return { success: false, error: 'Projekt-ID, datum och timmar är obligatoriska.' };
        }

        // Steg 2: Verifiera ägarskap av projektet
        const userOwnsProject = await verifyProjectOwnership(userId, entryData.projectId);
        if (!userOwnsProject) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        // Steg 3: Skapa tidrapporten i en sub-collection under projektet
        const timeEntriesCollectionRef = collection(db, 'users', userId, 'projects', entryData.projectId, 'timeEntries');
        const newDocRef = await addDoc(timeEntriesCollectionRef, {
            ...entryData,
            userId: userId, // Redundant but good for denormalization
            createdAt: serverTimestamp(),
        });

        return { success: true, timeEntryId: newDocRef.id };

    } catch (error) {
        console.error('Fel vid skapande av tidrapport:', error);
        return { success: false, error: 'Ett serverfel uppstod vid skapande av tidrapport.' };
    }
}

/**
 * GULDSTANDARD ACTION: `getTimeEntries`
 * Hämtar alla tidrapporter för ett specifikt projekt.
 * Säkerställer att användaren äger projektet innan rapporterna hämtas.
 */
export async function getTimeEntries(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.uid;

    try {
        // Steg 1: Validera indata
        if (!projectId) {
            return { success: false, error: 'Projekt-ID är obligatoriskt.' };
        }

        // Steg 2: Verifiera ägarskap av projektet
        const userOwnsProject = await verifyProjectOwnership(userId, projectId);
        if (!userOwnsProject) {
            return { success: false, error: 'Åtkomst nekad: Du kan inte se tidrapporter för detta projekt.' };
        }

        // Steg 3: Hämta tidrapporterna från sub-collection
        const timeEntriesCollectionRef = collection(db, 'users', userId, 'projects', projectId, 'timeEntries');
        const q = query(timeEntriesCollectionRef, where('projectId', '==', projectId)); // Fortfarande bra att ha kvar
        const querySnapshot = await getDocs(q);

        const timeEntries = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TimeEntry[];

        return { success: true, data: timeEntries };

    } catch (error) {
        console.error('Fel vid hämtning av tidrapporter:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av tidrapporter.' };
    }
}
