
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { type TimeEntry } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Definerar den förväntade indatan för att skapa en tidrapport.
export type CreateTimeEntryData = {
    projectId: string;
    date: Date;
    hours: number;
    description?: string;
    isBilled: boolean;
}

/**
 * Skapar en ny tidrapport.
 */
export async function createTimeEntry(entryData: CreateTimeEntryData): Promise<{ success: boolean; timeEntryId?: string; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const { projectId, date, hours, description, isBilled } = entryData;

        if (!projectId || !date || hours === undefined) {
            return { success: false, error: 'Projekt-ID, datum och timmar är obligatoriska.' };
        }

        // Verifiera ägarskap
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        const timeEntriesCollectionRef = projectRef.collection('timeEntries');
        
        const newTimeEntry = {
            userId,
            projectId,
            date: Timestamp.fromDate(new Date(date)),
            hours: Number(hours),
            description: description || '',
            isBilled: isBilled || false,
            createdAt: FieldValue.serverTimestamp(),
        };

        const newDocRef = await timeEntriesCollectionRef.add(newTimeEntry);

        return { success: true, timeEntryId: newDocRef.id };

    } catch (error) {
        console.error('Fel vid skapande av tidrapport:', error);
        return { success: false, error: 'Ett serverfel uppstod vid skapande av tidrapport.' };
    }
}

/**
 * Hämtar alla tidrapporter för ett specifikt projekt.
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

        // Verifiera ägarskap
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad: Du kan inte se tidrapporter för detta projekt.' };
        }

        const timeEntriesCollectionRef = projectRef.collection('timeEntries');
        const querySnapshot = await timeEntriesCollectionRef.orderBy('date', 'desc').get();

        const timeEntries: TimeEntry[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                projectId: data.projectId,
                date: data.date, 
                hours: data.hours,
                description: data.description || '',
                isBilled: data.isBilled || false,
            };
        });

        return { success: true, data: timeEntries };

    } catch (error) {
        console.error('Fel vid hämtning av tidrapporter:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av tidrapporter.' };
    }
}
