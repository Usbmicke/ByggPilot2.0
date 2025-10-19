
"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createInitialFolderStructure } from "@/services/driveService";
import * as dal from "@/lib/data-access"; // Importera hela DAL-modulen
import logger from "@/lib/logger";

// =================================================================================
// ONBOARDING ACTIONS V2.0 - REFAKTORERAD (GULDSTANDARD)
// ARKITEKTUR: Följer "Single Action" -principen. Actionen agerar som en
// orkestrerare som hanterar sessionen och anropar DAL och externa tjänster.
// Databaslogik och validering är helt delegerat till DAL.
// =================================================================================

/**
 * Hanterar hela onboarding-flödet steg för steg.
 * @param step Det steg i processen som ska exekveras.
 * @param data Den data som är associerad med steget.
 */
export async function completeOnboarding(step: number, data: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.accessToken) {
    // Använd logger för konsekvent felrapportering
    logger.error("[Action - Onboarding] Åtkomst nekad: Ogiltig session.", { step });
    return { success: false, error: "Åtkomst nekad: Ogiltig session." };
  }

  const userId = session.user.id;

  try {
    switch (step) {
      // STEG 1: Företagsprofil
      case 1:
        const companyProfile = await dal.updateUserCompanyProfile(userId, data);
        return { success: true, data: companyProfile };

      // STEG 2: Skapa Mappstruktur
      case 2:
        const companyName = await dal.getUserCompanyName(userId);
        const rootFolderId = await createInitialFolderStructure(session.accessToken, companyName);
        await dal.updateUserDriveRootFolder(userId, rootFolderId);
        return { success: true, data: { rootFolderId } };

      // STEG 3: Receptbok/Priser
      case 3:
        const recipeBook = await dal.updateUserRecipeBook(userId, data);
        return { success: true, data: recipeBook };

      // STEG 4: Slutförande
      case 4:
        await dal.markOnboardingAsComplete(userId);
        // Framtida logik för demo-projekt etc. skulle anropas här.
        return { success: true };

      default:
        logger.warn("[Action - Onboarding] Ogiltigt steg anropat.", { userId, step });
        return { success: false, error: "Ogiltigt steg." };
    }
  } catch (e) {
    const error = e as Error;
    // Logga felet centralt
    logger.error({
      message: `[Action - Onboarding] Fel vid steg ${step}`,
      userId: userId,
      error: error.message,
      // Om felet kommer från DAL och innehåller Zod-valideringsinfo, kan det vara bra att logga det.
      details: error.cause, 
      stack: error.stack,
    });
    // Returnera ett generiskt felmeddelande till klienten.
    return { success: false, error: error.message }; // Skicka meddelandet från DAL/tjänsten
  }
}
