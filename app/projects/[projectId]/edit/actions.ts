'use server';

import { getServerSession } from '@/app/lib/auth';
import { updateProject, archiveProject } from '@/app/services/projectService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProjectStatus } from '@/app/types';

export async function updateProjectAction(formData: FormData) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Authentication is required.');
  }

  const projectId = formData.get('projectId') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string | null;
  const status = formData.get('status') as ProjectStatus;
  const progress = Number(formData.get('progress'));
  const deadline = formData.get('deadline') as string | null;

  if (!projectId || !name) {
    throw new Error('Project ID and name are required.');
  }

  try {
    await updateProject(projectId, userId, {
      name,
      address,
      status,
      progress,
      deadline: deadline || null,
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    throw new Error('Could not update the project.');
  }

  // Invalidera cacher och omdirigera
  revalidatePath('/dashboard');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/edit`);
  redirect(`/projects/${projectId}`);
}


export async function archiveProjectAction(formData: FormData) {
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Authentication is required.');
    }

    const projectId = formData.get('projectId') as string;
    if (!projectId) {
        throw new Error('Project ID is required.');
    }

    try {
        await archiveProject(projectId, userId);
    } catch (error) {
        console.error("Failed to archive project:", error);
        throw new Error('Could not archive the project.');
    }

    // Invalidera cacher och omdirigera till projektlistan
    revalidatePath('/dashboard');
    revalidatePath('/projects');
    revalidatePath('/archive');
    redirect('/projects');
}
