
import { google } from 'googleapis';
import admin from 'firebase-admin';

/**
 * GULDSTANDARD v5.0: Google Drive-klient för Server-Side-körning.
 * Denna modul tillhandahåller en enda, återanvänd instans av Google Drive API-klienten.
 * Den är utformad för att köras i en säker servermiljö (som Next.js API-routes)
 * och autentiserar med applikationens standard-autentiseringsuppgifter via Firebase Admin SDK.
 */

// En global variabel för att cache:a den initialiserade Drive-klienten.
let drive: ReturnType<typeof google.drive> | null = null;

/**
 * Hämtar en autentiserad Google Drive API-klient.
 * Vid första anropet skapas och autentiseras klienten med hjälp av 
 * Firebase Admin SDK:s servicekonto. Efterföljande anrop returnerar den cache-lagrade instansen.
 * 
 * @throws {Error} Om Firebase Admin SDK inte har initierats.
 * @returns {drive_v3.Drive} En autentiserad instans av Google Drive v3 API.
 */
export function getGoogleDriveClient() {
  if (drive) {
    return drive;
  }

  console.log('[Google Drive Client]: Initierar Google Drive API-klient för server-side-körning.');

  // Säkerställ att Firebase Admin SDK är initierat, eftersom vi är beroende av dess autentiseringsuppgifter.
  if (!admin.apps.length) {
    throw new Error(
      "FATAL: Firebase Admin SDK har inte initierats. Anropa initializeAdminApp() innan du använder denna funktion."
    );
  }

  // Skapa en GoogleAuth-instans som automatiskt använder de autentiseringsuppgifter
  // som tillhandahålls av Firebase Admin SDK. Detta är den rekommenderade metoden för server-till-server-autentisering.
  const auth = new google.auth.GoogleAuth({
    credentials: admin.app().options.credential.cert,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  // Skapa Drive-klienten med den konfigurerade autentiseringen.
  // Biblioteket hanterar automatiskt hämtning och förnyelse av access tokens.
  drive = google.drive({ version: 'v3', auth });

  console.log('[Google Drive Client]: Klienten har skapats och är redo.');
  return drive;
}
