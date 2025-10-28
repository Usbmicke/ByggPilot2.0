
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions';
import { db } from '@/app/lib/firebase/firestore';
import { collection, addDoc, getDocs, query, serverTimestamp, doc, getDoc, Timestamp } from 'firebase/firestore';
import { TimeEntry } from '@/app/types/index';

async function verifyProjectOwnership(userId: string, projectId: string): Promise<boolean> {
    try {
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        return projectSnap.exists();
    } catch (error) {
        console.error('Error verifying project ownership:', error);
        return false;
    }
}

// Definerar den förväntade indatan för att skapa en tidrapport, skild från den fullständiga TimeEntry-typen.
export type CreateTimeEntryData = {
    projectId: string; // Behövs för att verifiera ägarskap och hitta rätt collection
    taskId: string;
    startTime: Date;
    endTime: Date;
    description?: string;
}

/**
 * Skapar en ny tidrapport.
 * VÄRLDSKLASS-KORRIGERING: Helt omskriven för att matcha den korrekta TimeEntry-datamodellen.
 * Tar emot korrekt data, validerar, och skapar ett typsäkert objekt.
 */
export async function createTimeEntry(entryData: CreateTimeEntryData): Promise<{ success: boolean; timeEntryId?: string; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const { projectId, taskId, startTime, endTime, description } = entryData;

        if (!projectId || !taskId || !startTime || !endTime) {
            return { success: false, error: 'Projekt-ID, Uppgifts-ID, starttid och sluttid är obligatoriska.' };
        }

        const userOwnsProject = await verifyProjectOwnership(userId, projectId);
        if (!userOwnsProject) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        const timeEntriesCollectionRef = collection(db, 'users', userId, 'projects', projectId, 'timeEntries');
        
        const newTimeEntry: Omit<TimeEntry, 'id'> = {
            userId,
            taskId,
            startTime: Timestamp.fromDate(startTime),
            endTime: Timestamp.fromDate(endTime),
            description: description || '',
        };

        const newDocRef = await addDoc(timeEntriesCollectionRef, newTimeEntry);

        return { success: true, timeEntryId: newDocRef.id };

    } catch (error) {
        console.error('Fel vid skapande av tidrapport:', error);
        return { success: false, error: 'Ett serverfel uppstod vid skapande av tidrapport.' };
    }
}

/**
 * Hämtar alla tidrapporter för ett specifikt projekt.
 * VÄRLDSKLASS-KORRIGERING: Använder säker mappning för att garantera att returdatan 
 * alltid matchar TimeEntry-typen.
 */
export async function getTimeEntries(projectId: string): Promise<{ success: boolean; data?: TimeEntry[]; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        if (!projectId) {
            return { success: false, error: 'Projekt-ID är obligatoriskt.' };
        }

        const userOwnsProject = await verifyProjectOwnership(userId, projectId);
        if (!userOwnsProject) {
            return { success: false, error: 'Åtkomst nekad: Du kan inte se tidrapporter för detta projekt.' };
        }

        const timeEntriesCollectionRef = collection(db, 'users', userId, 'projects', projectId, 'timeEntries');
        const querySnapshot = await getDocs(query(timeEntriesCollectionRef));

        const timeEntries: TimeEntry[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                taskId: data.taskId,
                startTime: data.startTime, // Förutsätter att detta är ett Firestore Timestamp
                endTime: data.endTime,     // Förutsätter att detta är ett Firestore Timestamp
                description: data.description || '',
            };
        });

        return { success: true, data: timeEntries };

    } catch (error) {
        console.error('Fel vid hämtning av tidrapporter:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av tidrapporter.' };
    }
}
