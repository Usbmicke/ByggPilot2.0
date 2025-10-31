
'use server';

import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { z } from 'zod'; // Importera z direkt

import { authOptions } from '@/lib/config/authOptions';
import { createOnboardingFolderStructure } from '@/lib/services/googleDriveService';
import { updateUser } from '@/lib/data-access';
import { logger } from '@/lib/logger';
import { UserSchema } from '@/lib/types';

// =================================================================================
// ONBOARDING ACTIONS V3.1 - Korrigerad Validering
// =================================================================================

const OnboardingPayloadSchema = UserSchema.pick({
  companyName: true,
  orgNumber: true,
  address: true,
  zipCode: true,
  city: true,
  phone: true,
  driveRootFolderId: true,
  driveRootFolderUrl: true,
}).extend({
    // KORRIGERING: Definierar om reglerna med korrekt syntax istället för
    // att försöka kedja vidare på en existerande, inkompatibel regel.
    companyName: z.string().min(2, 'Företagsnamn måste vara minst 2 tecken.'),
    driveRootFolderId: z.string().min(5, 'Drive-mappens ID saknas eller är ogiltigt.')
});

interface FinalizedUserData {
  companyName: string;
  hasCompletedOnboarding: boolean;
}

export async function setupDriveForOnboarding(companyName: string): Promise<{
  success: boolean;
  data?: {
    driveRootFolderId: string;
    driveRootFolderUrl: string;
  };
  error?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.error('[Onboarding Action: Drive] Åtkomst nekad: Ogiltig session.');
    return { success: false, error: 'Autentisering krävs.' };
  }

  if (!companyName || companyName.trim().length < 2) {
    return { success: false, error: 'Företagsnamnet är för kort.' };
  }

  try {
    logger.info(`[Onboarding Action: Drive] Påbörjar skapande av Drive-struktur för ${session.user.id}`);
    const driveResult = await createOnboardingFolderStructure(companyName);

    if (!driveResult.success) {
      throw new Error('Internt fel i Drive-tjänsten.');
    }
    
    logger.info(`[Onboarding Action: Drive] Drive-struktur skapad för ${session.user.id}.`);

    return {
      success: true,
      data: {
        driveRootFolderId: driveResult.parentFolderId,
        driveRootFolderUrl: driveResult.parentFolderUrl,
      },
    };
  } catch (error: any) {
    logger.error(`[Onboarding Action: Drive] Kritiskt fel för ${session.user.id}:`, error);
    return { success: false, error: `Kunde inte skapa mappstruktur i Google Drive: ${error.message}` };
  }
}

export async function finalizeOnboarding(onboardingData: unknown): Promise<{ 
  success: boolean; 
  error?: string;
  user?: FinalizedUserData;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.error('[Onboarding Action: Finalize] Åtkomst nekad: Ogiltig session.');
    return { success: false, error: 'Autentisering krävs.' };
  }

  const validationResult = OnboardingPayloadSchema.safeParse(onboardingData);

  if (!validationResult.success) {
    logger.warn(`[Onboarding Action: Finalize] Valideringsfel för ${session.user.id}:`, validationResult.error.flatten());
    return { success: false, error: 'Inskickad data är ogiltig.' };
  }

  try {
    logger.info(`[Onboarding Action: Finalize] Slutför onboarding för ${session.user.id}.`);
    
    const dataToUpdate = {
      ...validationResult.data,
      hasCompletedOnboarding: true,
    };

    await updateUser(session.user.id, dataToUpdate);

    logger.info(`[Onboarding Action: Finalize] Databas uppdaterad. Onboarding slutförd för ${session.user.id}.`);

    revalidatePath('/');

    return {
      success: true,
      user: {
        companyName: dataToUpdate.companyName!,
        hasCompletedOnboarding: dataToUpdate.hasCompletedOnboarding,
      }
    };

  } catch (error: any) {
    logger.error(`[Onboarding Action: Finalize] Kritiskt databasfel för ${session.user.id}:`, error);
    return { success: false, error: 'Ett internt fel uppstod vid uppdatering av din profil.' };
  }
}
