'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { createOnboardingFolderStructure } from '@/lib/services/googleDriveService'; // UPPDATERAD: Importerar den nya, korrekta funktionen
import { updateUser, getUser } from '@/lib/dal/users';
import { logger } from '@/lib/logger';

// --- SERVER ACTION: Onboarding-steg (Guldstandard-version) ---

export async function completeOnboardingStep(step: number, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.error("[Onboarding Action] Åtkomst nekad: Ogiltig session.", { step });
    return { success: false, error: "Åtkomst nekad: Ogiltig session." };
  }

  const userId = session.user.id;

  try {
    switch (step) {
      case 1: // Spara Företagsprofil
        logger.info(`[Onboarding Steg 1] Uppdaterar företagsprofil för användare ${userId}`);
        const { companyName } = data;
        if (!companyName || typeof companyName !== 'string') {
          return { success: false, error: "Ogiltigt företagsnamn." };
        }
        await updateUser(userId, { companyName });
        logger.info(`[Onboarding Steg 1] Företagsnamn '${companyName}' sparat för användare ${userId}.`);
        return { success: true };

      case 2: // Skapa Mappstruktur i Google Drive
        logger.info(`[Onboarding Steg 2] Påbörjar skapande av mappstruktur för användare ${userId}`);
        const user = await getUser(userId);
        if (!user) throw new Error("Användaren hittades inte i databasen.");
        if (!user.companyName) throw new Error("Företagsnamn saknas för användaren, kan inte skapa mapp.");

        // IDEMPOTENS-KONTROLL: Om mapp redan finns, hoppa över.
        if (user.driveRootFolderId) {
            logger.warn(`[Onboarding Steg 2] Drive-struktur finns redan för användare ${userId}. Avbryter för att undvika dubbletter.`);
            return { 
                success: true, // Returnera framgång eftersom målet är uppnått
                driveRootFolderId: user.driveRootFolderId,
                driveRootFolderUrl: user.driveRootFolderUrl, // Skicka tillbaka befintlig data
            }; 
        }

        // ANROPET KORRIGERAT: Anropar den nya, kraftfulla funktionen med företagsnamnet.
        const driveResult = await createOnboardingFolderStructure(user.companyName);
        
        // driveResult innehåller nu: { success, parentFolderId, parentFolderUrl }
        await updateUser(userId, { 
            driveRootFolderId: driveResult.parentFolderId,
            driveRootFolderUrl: driveResult.parentFolderUrl, // Spara den nya URL:en
        });

        logger.info(`[Onboarding Steg 2] Drive-struktur skapad. Rotmapp-ID: ${driveResult.parentFolderId}`);
        
        // Returnera all data som klienten behöver för att uppdatera sitt state.
        return { 
            success: true, 
            driveRootFolderId: driveResult.parentFolderId,
            driveRootFolderUrl: driveResult.parentFolderUrl
        };

      case 4: // Markera Onboarding som Slutförd
        logger.info(`[Onboarding Steg 4] Markerar onboarding som slutförd för användare ${userId}`);
        await updateUser(userId, { onboardingComplete: true });
        return { success: true };

      default:
        logger.warn("[Onboarding Action] Ogiltigt steg anropat.", { userId, step });
        return { success: false, error: "Ogiltigt steg." };
    }
  } catch (e) {
    const error = e as Error;
    logger.error({
      message: `[Onboarding Action] Kritiskt fel vid steg ${step}`,
      userId: userId,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: `Ett kritiskt serverfel inträffade: ${error.message}` };
  }
}
