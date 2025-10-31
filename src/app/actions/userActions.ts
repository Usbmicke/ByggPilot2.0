'use server';

import { revalidatePath } from 'next/cache';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';

/**
 * Marks a user's onboarding process as complete in Firestore.
 * This is a critical step to ensure the state persists across sessions.
 * @param userId - The ID of the user to update.
 * @returns An object indicating success or failure.
 */
export async function markOnboardingAsComplete(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    logger.error('[Action] markOnboardingAsComplete called without userId.');
    return { success: false, error: 'Användar-ID saknas.' };
  }

  logger.info(`[Action] Attempting to mark onboarding as complete for user: ${userId}`);

  try {
    const userRef = firestoreAdmin.collection('users').doc(userId);
    
    // Använd `update` för att säkerställa att vi inte skriver över hela dokumentet.
    // Databasfältet `hasCompletedOnboarding` måste matcha det som läses i authOptions.
    await userRef.update({
      hasCompletedOnboarding: true
    });

    logger.info(`[Action] Successfully marked onboarding as complete for user: ${userId}`);
    
    // Invalidera cachen för sökvägar som är beroende av denna status.
    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return { success: true };
  } catch (error) {
    logger.error(`[Action] Failed to mark onboarding as complete for user ${userId}.`, { error });
    return { success: false, error: 'Ett databasfel inträffade.' };
  }
}
