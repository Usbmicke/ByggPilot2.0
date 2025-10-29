
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { type Task } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';


/**
 * Hämtar alla uppgifter för ett specifikt projekt.
 * VÄRLDSKLASS-KORRIGERING: Mappar `completed` från databasen till `isCompleted` i Task-typen.
 */
export async function getTasks(projectId: string): Promise<{ success: boolean; data?: Task[]; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        const tasksCollectionRef = projectRef.collection('tasks');
        const querySnapshot = await tasksCollectionRef.get();

        const tasks: Task[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                projectId: projectId,
                title: data.title || 'Namnlös uppgift',
                description: data.description || undefined,
                isCompleted: data.completed || data.isCompleted || false, // Hanterar båda fältnamnen
                deadline: data.deadline?.toDate(),
                createdAt: data.createdAt?.toDate(),
            };
        });

        return { success: true, data: tasks };

    } catch (error) {
        console.error('Fel vid hämtning av uppgifter:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av uppgifter.' };
    }
}

/**
 * Skapar en ny uppgift för ett specifikt projekt.
 */
export async function createTask(projectId: string, title: string): Promise<{ success: boolean; data?: Task; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad: Du kan inte skapa uppgifter för detta projekt.' };
        }

        const tasksCollectionRef = projectRef.collection('tasks');
        const newTaskData = {
            title,
            projectId,
            isCompleted: false,
            createdAt: FieldValue.serverTimestamp(),
            userId,
        };
        const docRef = await tasksCollectionRef.add(newTaskData);

        const returnData: Task = {
            id: docRef.id,
            title: newTaskData.title,
            isCompleted: newTaskData.isCompleted,
            projectId: newTaskData.projectId,
        };

        return { success: true, data: returnData };

    } catch (error) {
        console.error('Fel vid skapande av uppgift:', error);
        return { success: false, error: 'Ett serverfel uppstod vid skapande av uppgift.' };
    }
}

/**
 * Uppdaterar en befintlig uppgift.
 */
export async function updateTask(taskId: string, projectId: string, updates: Partial<Pick<Task, 'title' | 'isCompleted'>>): Promise<{ success: boolean; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        // Först, verifiera att användaren äger projektet
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad.' };
        }

        // Nu, uppdatera uppgiften
        const taskRef = projectRef.collection('tasks').doc(taskId);
        await taskRef.update(updates);

        return { success: true };

    } catch (error) {
        console.error('Fel vid uppdatering av uppgift:', error);
        return { success: false, error: 'Ett serverfel uppstod vid uppdatering av uppgift.' };
    }
}
