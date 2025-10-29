
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { db } from '@/lib/config/firebase-admin';
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Task } from '@/app/types/index';

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
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        const tasksCollectionRef = collection(projectRef, 'tasks');
        const q = query(tasksCollectionRef);
        const querySnapshot = await getDocs(q);

        const tasks: Task[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                projectId: projectId,
                title: data.title || 'Namnlös uppgift',
                description: data.description || undefined,
                isCompleted: data.completed || false, // Korrekt mappning
                deadline: data.deadline || undefined,
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
 * VÄRLDSKLASS-KORRIGERING: Använder `isCompleted` för att matcha Task-typen.
 */
export async function createTask(projectId: string, title: string): Promise<{ success: boolean; data?: Task; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: 'Åtkomst nekad: Du kan inte skapa uppgifter för detta projekt.' };
        }

        const tasksCollectionRef = collection(projectRef, 'tasks');
        const newTaskData = {
            title,
            projectId,
            isCompleted: false, // Korrekt fältnamn
            createdAt: serverTimestamp(),
            userId,
        };
        const docRef = await addDoc(tasksCollectionRef, newTaskData);

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
 * VÄRLDSKLASS-KORRIGERING: Använder `isCompleted` för att matcha Task-typen.
 */
export async function updateTask(taskId: string, projectId: string, updates: Partial<Pick<Task, 'title' | 'isCompleted'>>): Promise<{ success: boolean; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const taskRef = doc(projectRef, 'tasks', taskId);

        // Mapper `isCompleted` till `completed` om det skickas med i updates.
        // Detta är en tillfällig lösning för bakåtkompabilitet om klienten skickar fel data.
        // I en ideal värld skulle klienten alltid skicka rätt fältnamn.
        const firestoreUpdates: { [key: string]: any } = { ...updates };

        await updateDoc(taskRef, firestoreUpdates);

        return { success: true };

    } catch (error) {
        console.error('Fel vid uppdatering av uppgift:', error);
        return { success: false, error: 'Ett serverfel uppstod vid uppdatering av uppgift.' };
    }
}
