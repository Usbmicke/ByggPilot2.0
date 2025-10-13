'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateProject, archiveProject } from '@/services/projectService';
import { Project, ProjectStatus } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Server Action för att uppdatera ett projekt.
 */
export async function updateProjectAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error("Autentisering krävs.");
    }

    const projectId = formData.get('projectId') as string;
    if (!projectId) {
        throw new Error("Projekt-ID saknas.");
    }

    const deadlineValue = formData.get('deadline') as string;

    const updates: Partial<Project> = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        status: formData.get('status') as ProjectStatus,
        progress: Number(formData.get('progress')),
        deadline: deadlineValue ? new Date(deadlineValue) : null
    };

    try {
        await updateProject(projectId, userId, updates);
    } catch (error) {
        console.error("Misslyckades med att uppdatera projektet:", error);
        throw new Error("Kunde inte uppdatera projektet på grund av ett serverfel.");
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    redirect(`/projects/${projectId}`);
}

/**
 * Server Action för att arkivera ett projekt.
 */
export async function archiveProjectAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error("Autentisering krävs.");
    }
    
    const projectId = formData.get('projectId') as string;
    if (!projectId) {
        throw new Error("Projekt-ID saknas.");
    }

    try {
        await archiveProject(projectId, userId);
    } catch (error) {
        console.error("Misslyckades med att arkivera projektet:", error);
        throw new Error("Kunde inte arkivera projektet på grund av ett serverfel.");
    }

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    redirect('/projects');
}
