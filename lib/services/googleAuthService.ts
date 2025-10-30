
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
// GULDSTANDARD-KORRIGERING: Pekar nu till den korrekta DAL-filen 'users.ts'
import { getAccountByUserId, updateAccount } from '@/lib/dal/users'; 
import { logger } from '@/lib/logger';

/**
 * Hjärtat i Google-autentisering. Hämtar en giltig och uppdaterad OAuth2-klient.
 * Denna funktion är kritisk för ALLA interaktioner med Google API:er.
 */
export async function authenticate() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        logger.error('[AuthService] Autentisering misslyckades: Ingen session hittades.');
        return null;
    }

    const userId = session.user.id;
    const account = await getAccountByUserId(userId);

    if (!account || !account.access_token || !account.refresh_token) {
        logger.error(`[AuthService] Autentisering misslyckades: Inga tokens hittades för användare ${userId}.`);
        return null;
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.expires_at ? account.expires_at * 1000 : null,
    });

    // MAGIN: Om access_token är på väg att gå ut, uppdaterar vi det proaktivt.
    // Detta förhindrar API-anrop från att misslyckas i onödan.
    if (account.expires_at && new Date().getTime() > (account.expires_at - 5 * 60) * 1000) {
        logger.info(`[AuthService] Access token för användare ${userId} är på väg att gå ut. Förnyar...`);
        try {
            const { credentials } = await auth.refreshAccessToken();
            // Uppdatera databasen med de nya, fräscha tokens.
            await updateAccount(userId, {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token, // Vissa flöden ger en ny refresh token
                expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
            });
            auth.setCredentials(credentials);
            logger.info(`[AuthService] Access token förnyat och sparat för användare ${userId}.`);
        } catch (error) {
            logger.error(`[AuthService] Kritiskt fel vid förnyelse av token för användare ${userId}:`, error);
            return null; // Förhindra att en ogiltig auth-klient används
        }
    }

    return auth;
}
