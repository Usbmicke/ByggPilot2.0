'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { createInitialFolderStructure } from '@/actions/driveActions';
import { updateUser, getUser } from '@/lib/dal/users'; // Korrekt DAL-import
import { logger } from '@/lib/logger';

// --- SÄKER TOKEN-HANTERING ---

/**
 * GULDSTANDARD: Hämtar ett garanterat färskt access token för API-anrop.
 * Använder det sparade refresh token för att skapa ett nytt access token,
 * vilket kringgår det kortlivade token som NextAuth hanterar.
 * @param userId Användarens ID
 * @returns Ett nytt, giltigt access token.
 */
async function getRefreshedAccessToken(userId: string): Promise<string> {
    logger.info(`[Token Refresh] Attempting to refresh access token for user ${userId}`);
    
    // Steg 1: Hämta användarens sparade refresh token från databasen via DAL.
    const user = await getUser(userId);
    const refreshToken = user?.refreshToken;
    if (!refreshToken) {
        logger.error(`[Token Refresh] Failed: No refresh token found for user ${userId}.`);
        throw new Error('No refresh token found for user.');
    }

    // Steg 2: Skicka en POST-request till Googles OAuth2-server.
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
        cache: 'no-store' // Tvinga alltid en ny hämtning
    });

    const tokens = await response.json();
    if (!response.ok) {
        logger.error('[Token Refresh] Failed to refresh access token from Google', { error: tokens, userId });
        throw new Error('Failed to refresh access token.');
    }

    logger.info(`[Token Refresh] Successfully refreshed access token for user ${userId}`);

    // Steg 3: Returnera det nya, färska access tokenet.
    return tokens.access_token;
}

// --- SERVER ACTION: Onboarding-steg ---

export async function completeOnboardingStep(step: number, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    logger.error("[Onboarding Action] Access Denied: Invalid session.", { step });
    return { success: false, error: "Åtkomst nekad: Ogiltig session." };
  }

  const userId = session.user.id;

  try {
    switch (step) {
      case 1: // Spara Företagsprofil
        logger.info(`[Onboarding Step 1] Updating company profile for user ${userId}`);
        const { companyName } = data;
        if (!companyName || typeof companyName !== 'string') {
          return { success: false, error: "Ogiltigt företagsnamn." };
        }
        // Inga externa API-anrop, så ingen token behövs. Uppdatera bara DB.
        await updateUser(userId, { companyName });
        return { success: true };

      case 2: // Skapa Mappstruktur i Google Drive
        logger.info(`[Onboarding Step 2] Init for user ${userId}`);
        const user = await getUser(userId);
        if (!user) throw new Error("Användaren hittades inte i databasen.");

        // IDEMPOTENS-KONTROLL: Om mapp redan finns, hoppa över.
        if (user.driveRootFolderId) {
            logger.info(`[Onboarding Step 2] Drive structure already exists for user ${userId}. Skipping.`);
            return { success: true, driveRootFolderId: user.driveRootFolderId, driveRootFolderUrl: user.driveRootFolderUrl };
        }

        const name = user.companyName;
        if (!name) {
             return { success: false, error: "Företagsnamn är inte satt." };
        }
        
        // GULDSTANDARD-FIX: Hämta ett garanterat färskt token FÖRE API-anrop.
        const accessToken = await getRefreshedAccessToken(userId);
        
        const { rootFolderId, rootFolderUrl } = await createInitialFolderStructure(accessToken, name);
        await updateUser(userId, { 
            driveRootFolderId: rootFolderId,
            driveRootFolderUrl: rootFolderUrl,
        });
        logger.info(`[Onboarding Step 2] Drive structure created. Root folder ID: ${rootFolderId}`);
        return { success: true, driveRootFolderId: rootFolderId, driveRootFolderUrl: rootFolderUrl };

      case 4: // Markera Onboarding som Slutförd
        logger.info(`[Onboarding Step 4] Marking onboarding as complete for user ${userId}`);
        await updateUser(userId, { onboardingComplete: true });
        // Inga externa API-anrop, så ingen token behövs.
        return { success: true };

      default:
        logger.warn("[Onboarding Action] Invalid step called.", { userId, step });
        return { success: false, error: "Ogiltigt steg." };
    }
  } catch (e) {
    const error = e as Error;
    logger.error({
      message: `[Onboarding Action] Error at step ${step}`,
      userId: userId,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: `Ett kritiskt fel inträffade: ${error.message}` };
  }
}
