'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Project, ProjectStatus } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { logger } from '@/lib/logger';

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
        projectName: formData.get('projectName') as string,
        projectDescription: formData.get('projectDescription') as string,
        status: formData.get('status') as ProjectStatus,
    };

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({ projectId, updates })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Okänt fel vid uppdatering av projekt');
        }
    } catch (error) {
        logger.error({ error, projectId, updates }, "Misslyckades med att uppdatera projektet:");
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/archive`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Okänt fel vid arkivering av projekt');
        }
    } catch (error) {
        logger.error({ error, projectId }, "Misslyckades med att arkivera projektet:");
        throw new Error("Kunde inte arkivera projektet på grund av ett serverfel.");
    }

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    redirect('/projects');
}
