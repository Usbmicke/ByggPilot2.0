
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
// GULDSTANDARD-KORRIGERING: Importerar nu den korrekta funktionen från vår DAL.
import { getAccountByUserId, updateUser } from '@/lib/dal/users'; 
import { logger } from '@/lib/logger';

export async function authenticate() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.error('[AuthService] Autentisering misslyckades: Ingen session hittades.');
        return null;
    }

    const userId = session.user.id;
    // KORRIGERING: Använder nu den nya, korrekta funktionen för att hämta kontot.
    const account = await getAccountByUserId(userId);

    if (!account || !(account as any).access_token || !(account as any).refresh_token) {
        logger.error(`[AuthService] Autentisering misslyckades: Inga tokens hittades för användare ${userId} i 'accounts'-samlingen.`);
        return null;
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
        access_token: (account as any).access_token,
        refresh_token: (account as any).refresh_token,
        expiry_date: (account as any).expires_at ? (account as any).expires_at * 1000 : null,
    });

    // ... (Logiken för att uppdatera token förblir densamma)
    if ((account as any).expires_at && new Date().getTime() > ((account as any).expires_at - 5 * 60) * 1000) {
        logger.info(`[AuthService] Access token för användare ${userId} är på väg att gå ut. Förnyar...`);
        try {
            const { credentials } = await auth.refreshAccessToken();
            await updateUser(userId, {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token,
                expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
            });
            auth.setCredentials(credentials);
            logger.info(`[AuthService] Access token förnyat och sparat för användare ${userId}.`);
        } catch (error) {
            logger.error(`[AuthService] Kritiskt fel vid förnyelse av token för användare ${userId}:`, error);
            return null;
        }
    }

    return auth;
}
