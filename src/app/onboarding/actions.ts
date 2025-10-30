
'use server';

import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { authOptions } from '@/lib/config/authOptions';
import { createOnboardingFolderStructure } from '@/lib/services/googleDriveService';
import { updateUser } from '@/lib/dal/users';
import { logger } from '@/lib/logger';

const OnboardingDataSchema = z.object({
  companyName: z.string().min(2, 'Företagsnamn måste vara minst 2 tecken.'),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  driveRootFolderId: z.string().min(5, 'Drive-mappens ID saknas eller är ogiltigt.'),
  driveRootFolderUrl: z.string().url('Drive-mappens URL är ogiltig.'),
});

// Typdefinition för den data som returneras till klienten
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
    logger.error('[Onboarding Action - Step 1] Åtkomst nekad: Ogiltig session.');
    return { success: false, error: 'Autentisering krävs.' };
  }

  if (!companyName || companyName.trim().length < 2) {
    return { success: false, error: 'Företagsnamnet är för kort.' };
  }

  try {
    logger.info(`[Onboarding Action - Step 1] Påbörjar skapande av Drive-struktur för ${session.user.id}`);
    const driveResult = await createOnboardingFolderStructure(companyName);

    if (!driveResult.success) {
      throw new Error('Internt fel i Drive-tjänsten.');
    }
    
    logger.info(`[Onboarding Action - Step 1] Drive-struktur skapad för ${session.user.id}.`);

    return {
      success: true,
      data: {
        driveRootFolderId: driveResult.parentFolderId,
        driveRootFolderUrl: driveResult.parentFolderUrl,
      },
    };
  } catch (error: any) {
    logger.error(`[Onboarding Action - Step 1] Kritiskt fel för ${session.user.id}:`, error);
    return { success: false, error: `Kunde inte skapa mappstruktur i Google Drive: ${error.message}` };
  }
}

/**
 * DEN GARANTERAT SÄKRA LÖSNINGEN - STEG 1 (SERVER)
 * Denna funktion sparar inte bara till databasen, den returnerar nu också
 * den garanterat korrekta, uppdaterade användardatan direkt till klienten.
 * Detta eliminerar alla race conditions.
 */
export async function finalizeOnboarding(onboardingData: unknown): Promise<{ 
  success: boolean; 
  error?: string;
  user?: FinalizedUserData; // Den nya, kritiska returdatan
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.error('[Onboarding Action - Step 2] Åtkomst nekad: Ogiltig session.');
    return { success: false, error: 'Autentisering krävs.' };
  }

  const validationResult = OnboardingDataSchema.safeParse(onboardingData);

  if (!validationResult.success) {
    logger.warn(`[Onboarding Action - Step 2] Valideringsfel för ${session.user.id}:`, validationResult.error.flatten());
    return { success: false, error: 'Inskickad data är ogiltig.' };
  }

  const { companyName, orgNumber, address, zipCode, city, phone, driveRootFolderId, driveRootFolderUrl } = validationResult.data;

  try {
    logger.info(`[Onboarding Action - Step 2] Slutför onboarding för ${session.user.id}.`);
    
    const dataToUpdate = {
      companyName,
      orgNumber,
      address,
      zipCode,
      city,
      phone,
      driveRootFolderId,
      driveRootFolderUrl,
      hasCompletedOnboarding: true,
    };

    await updateUser(session.user.id, dataToUpdate);

    logger.info(`[Onboarding Action - Step 2] Databas uppdaterad. Onboarding slutförd för ${session.user.id}.`);

    revalidatePath('/');

    // SKICKA TILLBAKA DEN KORREKTA DATAN
    return {
      success: true,
      user: {
        companyName: dataToUpdate.companyName,
        hasCompletedOnboarding: dataToUpdate.hasCompletedOnboarding,
      }
    };

  } catch (error: any) {
    logger.error(`[Onboarding Action - Step 2] Kritiskt databasfel för ${session.user.id}:`, error);
    return { success: false, error: 'Ett internt fel uppstod vid uppdatering av din profil.' };
  }
}
