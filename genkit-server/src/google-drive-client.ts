
import { google } from 'googleapis';

// GULDSTANDARD v15.0: Isolerad Google Drive-klient för Genkit Server.

let drive: ReturnType<typeof google.drive> | null = null;

export function getGoogleDriveClient() {
  if (drive) {
    return drive;
  }

  console.log('[Genkit Google Drive Client]: Initierar Google Drive API-klient.');

  // I en korrekt konfigurerad servermiljö (som Cloud Run där Genkit körs),
  // kommer GoogleAuth automatiskt att hitta Application Default Credentials.
  // Detta tar bort behovet av att manuellt hantera service account-nycklar.
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  drive = google.drive({ version: 'v3', auth });

  console.log('[Genkit Google Drive Client]: Klienten har skapats och är redo.');
  return drive;
}
