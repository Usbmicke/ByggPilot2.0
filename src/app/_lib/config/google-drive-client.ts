
import { google } from 'googleapis';
import admin from 'firebase-admin';

// En global variabel för att cache:a Drive-klienten
let driveClient: any = null;

export async function getGoogleDriveClient() {
  if (driveClient) {
    return driveClient;
  }

  console.log('[Google Drive Client]: Skapar ny Google Drive API-klient.');

  try {
    // Säkerställ att Firebase Admin SDK är initierat
    if (!admin.apps.length) {
        throw new Error("Firebase Admin SDK har inte initierats.");
    }

    // Hämta en access token från service-kontot
    const auth = new google.auth.GoogleAuth({
        // Använd samma service account som Firebase Admin SDK
        credentials: admin.app().options.credential.cert,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    
    const authClient = await auth.getClient();

    // Skapa Drive-klienten med den auktoriserade klienten
    driveClient = google.drive({ version: 'v3', auth: authClient });

    console.log('[Google Drive Client]: Google Drive API-klient skapad och autentiserad.');
    return driveClient;

  } catch (error) {
    console.error("[FATAL] Kunde inte skapa Google Drive-klient:", error);
    throw new Error("Allvarligt fel vid anslutning till Google Drive API.");
  }
}
