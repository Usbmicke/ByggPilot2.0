
import { google } from 'googleapis';
import { firestoreAdmin } from '@/app/lib/firebase-admin';

/**
 * Skapar och returnerar en autentiserad Google OAuth2-klient för en specifik användare.
 * Denna klient kan användas för att interagera med olika Google APIs (Drive, Calendar, etc.)
 * för användarens räkning.
 *
 * @param userId - Firestore-dokument-ID för användaren.
 * @returns En fullt autentiserad OAuth2-klient, eller null om tokens saknas.
 */
export async function getGoogleAuthClient(userId: string) {
  try {
    // 1. Hämta användarens sparade tokens från Firestore
    const accountDoc = await firestoreAdmin
      .collection('users')
      .doc(userId)
      .collection('accounts')
      .doc('google') // Vi antar att providern heter 'google'
      .get();

    if (!accountDoc.exists) {
      console.error(`[Auth Client Error] Inga Google-kontouppgifter hittades för användare ${userId}.`);
      return null;
    }

    const accountData = accountDoc.data();
    const accessToken = accountData?.access_token;
    const refreshToken = accountData?.refresh_token;

    if (!refreshToken) {
      console.error(`[Auth Client Error] Refresh token saknas för användare ${userId}. Användaren måste återautentisera.`);
      // Kasta ett fel här, eftersom en refresh token är nödvändig för långvarig åtkomst.
      throw new Error('Refresh token is missing. Please re-authenticate.');
    }

    // 2. Skapa en OAuth2-klient med appens credentials
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI 
    );

    // 3. Sätt de hämtade tokens på klienten
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      // expiry_date kan också sättas om det finns, men refresh token är viktigast.
    });

    // 4. Hantera automatisk uppdatering av access token
    // Om access token har gått ut, kommer oAuth2Client automatiskt att använda
    // refresh token för att hämta en ny. Vi kan lyssna på detta event.
    oAuth2Client.on('tokens', (tokens) => {
        if (tokens.access_token) {
            console.log(`[Auth Client] Ny access token genererad för användare ${userId}.`);
            // Uppdatera den nya access token i databasen för framtida bruk
            firestoreAdmin
                .collection('users')
                .doc(userId)
                .collection('accounts')
                .doc('google')
                .update({ access_token: tokens.access_token, expiry_date: tokens.expiry_date })
                .catch(err => console.error("Kunde inte spara ny access token:", err));
        }
    });

    console.log(`[Auth Client] Google Auth-klient skapad framgångsrikt för användare ${userId}.`);
    return oAuth2Client;

  } catch (error) {
    console.error(`[Auth Client Critical] Ett allvarligt fel uppstod i getGoogleAuthClient för användare ${userId}:`, error);
    return null;
  }
}

/**
 * Skapar och returnerar en Google Drive API-klient för en specifik användare.
 * 
 * @param userId - Firestore-dokument-ID för användaren.
 * @returns En Google Drive v3-klient, eller null vid autentiseringsfel.
 */
export async function getGoogleDriveService(userId: string) {
    const authClient = await getGoogleAuthClient(userId);
    if (!authClient) {
        return null;
    }
    return google.drive({ version: 'v3', auth: authClient });
}

// Du kan lägga till fler service-funktioner här för Calendar, Gmail etc.
// export async function getGoogleCalendarService(userId: string) { ... }
