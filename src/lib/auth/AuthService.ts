
import { google } from 'googleapis';
import { getAccountByUserId } from '@/lib/dal/users'; // Importera den korrekta DAL-funktionen
import { logger } from '@/lib/logger';

/**
 * AuthService v3 - Korrigerad
 * Denna version har EN avgörande ändring: Den använder `getAccountByUserId` 
 * för att hämta tokens från `accounts`-samlingen, vilket är den enda
 * korrekta datakällan som hanteras av den officiella Firestore-adaptern.
 * Detta löser felet där tokens inte kunde hittas.
 */
class AuthService {
    private getOAuth2Client() {
        return new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
    }

    private async getTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
        logger.info(`[AuthService] Försöker hämta tokens för användare ${userId}`);
        
        // KORRIGERING: Hämta från `accounts`-samlingen via DAL.
        const account = await getAccountByUserId(userId);

        if (!account || !account.access_token || !account.refresh_token) {
            logger.error(`[AuthService] Autentisering misslyckades: Inga tokens hittades för användare ${userId} i 'accounts'-samlingen.`);
            throw new Error(`Kunde inte hitta tokens för användare ${userId}`);
        }

        logger.info(`[AuthService] Hittade tokens för ${userId}.`);
        return {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
        };
    }

    public async getFreshAccessToken(userId: string): Promise<string> {
        const { refreshToken } = await this.getTokens(userId);
        const oauth2Client = this.getOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        try {
            const { credentials } = await oauth2Client.refreshAccessToken();
            if (!credentials.access_token) {
                throw new Error('Misslyckades med att uppdatera access token.');
            }
            logger.info(`[AuthService] Access token uppdaterat för användare ${userId}.`);
            return credentials.access_token;
        } catch (error) {
            logger.error(`[AuthService] Fel vid uppdatering av access token för ${userId}:`, error);
            throw error;
        }
    }
}

export const authService = new AuthService();
