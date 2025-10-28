
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/firebase/firestore';
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Task } from '@/app/types/index';

/**
 * GULDSTANDARD ACTION: `getTasks`
 * Hämtar alla uppgifter för ett specifikt projekt.
 * Säkerställer att användaren äger projektet innan uppgifterna hämtas.
 */
export async function getTasks(projectId: string) {
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

        // Steg 2: Hämta uppgifterna från sub-collection
        const tasksCollectionRef = collection(projectRef, 'tasks');
        const q = query(tasksCollectionRef);
        const querySnapshot = await getDocs(q);

        const tasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(), // Hantera timestamp-konvertering
        })) as Task[];

        return { success: true, data: tasks };

    } catch (error) {
        console.error('Fel vid hämtning av uppgifter:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av uppgifter.' };
    }
}

/**
 * GULDSTANDARD ACTION: `createTask`
 * Skapar en ny uppgift för ett specifikt projekt.
 * Säkerställer att användaren äger projektet innan uppgiften skapas.
 */
export async function createTask(projectId: string, text: string) {
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
            return { success: false, error: 'Åtkomst nekad: Du kan inte skapa uppgifter för detta projekt.' };
        }

        // Steg 2: Skapa den nya uppgiften
        const tasksCollectionRef = collection(projectRef, 'tasks');
        const newTaskData = {
            text,
            projectId,
            completed: false,
            createdAt: serverTimestamp(),
            userId, // Spara användar-ID för framtida bruk
        };
        const docRef = await addDoc(tasksCollectionRef, newTaskData);

        return { success: true, data: { id: docRef.id, ...newTaskData } };

    } catch (error) {
        console.error('Fel vid skapande av uppgift:', error);
        return { success: false, error: 'Ett serverfel uppstod vid skapande av uppgift.' };
    }
}
