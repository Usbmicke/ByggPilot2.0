'use server';

import { getServerSession } from '@/lib/auth';
import { createProject } from '@/services/projectService';
import { getCustomer } from '@/services/customerService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProjectStatus } from '@/types';
import { logger } from '@/lib/logger';

export async function createProjectAction(formData: FormData) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Authentication is required.');
  }

  const customerId = formData.get('customerId') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string | null;
  const deadline = formData.get('deadline') as string | null;

  if (!name || !customerId) {
    throw new Error('Name and customer are required fields.');
  }

  const customer = await getCustomer(customerId, userId);
  if (!customer) {
      throw new Error('Customer not found or access denied.');
  }

  const projectData = {
      userId,
      name,
      customerId,
      customerName: customer.name, // Denormalisera kundnamn för enklare åtkomst
      address,
      status: ProjectStatus.NotStarted,
      progress: 0,
      deadline: deadline || null, // Spara deadline
  };

  try {
    const newProject = await createProject(projectData);
    
    // Omdirigera till den nya projektdetaljsidan
    redirect(`/projects/${newProject.id}`);

  } catch (error) {
    logger.error({ error, projectData }, "Failed to create project:");
    throw new Error('Could not create the project due to a server error.');
  }

  // Invalidera cacher för att visa den nya datan
  revalidatePath('/projects');
  revalidatePath('/dashboard');
}
