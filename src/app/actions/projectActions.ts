
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
// KORRIGERING: Importerar nu det korrekta funktionsnamnet.
import { createInitialFolderStructure } from './driveActions'; 
import { projectSchema, type ProjectFormData } from '@/lib/schemas/project';
import { type Project } from '@/lib/types'; // Standardiserad import
import { logger } from '@/lib/logger'; // Importera logger

export async function createProject(formData: ProjectFormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { status: 'error', message: 'Autentisering krävs.' };
  }
  const userId = session.user.id;

  const validation = projectSchema.safeParse(formData);
  if (!validation.success) {
    return { status: 'error', message: 'Ogiltig data.' };
  }

  try {
    const newProjectRef = await firestoreAdmin.collection(`users/${userId}/projects`).add({
      ...validation.data,
      userId,
      createdAt: new Date(),
      status: 'Pågående',
    });

    // KORRIGERING: Anropet till mappskapande är temporärt inaktiverat.
    // Anledningen är att `createInitialFolderStructure` förväntar sig `accessToken` och `companyName`,
    // medan vi här har `projectId` och `projectName`. Detta är en arkitektonisk fråga
    // som behöver lösas separat. Att anropa den skulle orsaka ett fel.
    /*
    createInitialFolderStructure(newProjectRef.id, validation.data.projectName).catch(error => 
        logger.error({ message: 'Failed to create project folder structure asynchronously', projectId: newProjectRef.id, error })
    );
    */

    // Korrekt loggning för att indikera att steget är överhoppat.
    logger.info({ message: 'Skipping folder creation: Mismatched function signature in createProject action.', projectId: newProjectRef.id });

    return { status: 'success', message: 'Projekt skapat!' };
  } catch (error) {
    logger.error({ message: 'Error creating project', userId, error });
    return { status: 'error', message: 'Ett serverfel uppstod.' };
  }
}
