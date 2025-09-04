
import { google } from 'googleapis';

// Denna konfiguration är grunden för all kommunikation med Google APIs.
// Den läser in dina hemliga nycklar från miljövariabler för att säkert kunna autentisera.

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    // Detta är en kritisk kontroll för att säkerställa att applikationen är korrekt konfigurerad.
    // Utan dessa nycklar kan vi inte kommunicera med Google.
    throw new Error("Missing Google API credentials in .env.local file. Please add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI");
}

/**
 * Skapar och konfigurerar en OAuth2-klient som kan återanvändas för olika Google API-anrop.
 * Denna klient är "stateless" tills den får en användares specifika tokens.
 */
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Definierar de "scopes" (behörigheter) som vår applikation kommer att be om.
// Just nu behöver vi full åtkomst till Drive för att kunna skapa mappar och hantera filer.
export const GOOGLE_DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Genererar den unika URL dit användaren ska skickas för att ge sitt medgivande.
 * @returns En URL till Googles samtyckesskärm.
 */
export const getGoogleAuthUrl = () => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Ber om en refresh_token så användaren inte behöver logga in igen
        prompt: 'consent',       // Visar alltid samtyckesskärmen för att säkerställa att vi får en refresh_token
        scope: GOOGLE_DRIVE_SCOPES
    });
    return url;
};

/**
 * Tar emot koden från Google efter att användaren gett sitt medgivande
 * och byter den mot access och refresh tokens.
 * @param code - Koden som Google skickar tillbaka.
 * @returns Ett promise som resolverar till token-objektet.
 */
export const getGoogleTokens = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};
