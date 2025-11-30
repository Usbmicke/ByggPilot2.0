
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Funktion för att skapa en autentiserad Google Drive-klient.
// Använder ADC (Application Default Credentials) för server-till-server-autentisering.
async function getDriveClient() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const authClient = await auth.getClient();
  return google.drive({ version: 'v3', auth: authClient });
}

/**
 * Skapar en mapp i Google Drive.
 * @param name Namnet på mappen som ska skapas.
 * @returns ID för den nyskapade mappen.
 */
export async function createFolder(name: string): Promise<string> {
  const drive = await getDriveClient();
  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    if (!file.data.id) {
      throw new Error('Misslyckades med att skapa mappen, fick inget ID tillbaka.');
    }
    console.log(`Mapp skapad med ID: ${file.data.id}`);
    return file.data.id;
  } catch (error) {
    console.error("Fel vid skapande av mapp i Google Drive:", error);
    // Kasta ett mer specifikt fel för bättre felhantering uppströms
    throw new Error(`Kunde inte skapa mapp i Drive: ${error.message}`);
  }
}
