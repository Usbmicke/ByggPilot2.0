
import 'server-only';
import { google } from 'googleapis';
import { auth as googleAuth } from '@googleapis/drive';

// Konfigurera Google Drive API-klient
// Detta kommer att använda de miljövariabler du ställer in i .env.local
const auth = new googleAuth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Skapar en ny mapp i Google Drive.
 * @param companyName - Namnet på företaget, som också blir namnet på mappen.
 * @returns ID för den nyskapade mappen.
 */
export async function createFolder(companyName: string): Promise<string> {
  const fileMetadata = {
    name: companyName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    if (!file.data.id) {
      throw new Error('Folder creation did not return an ID.');
    }
    return file.data.id;
  } catch (err) {
    // Logga felet för felsökning
    console.error('Error creating Google Drive folder:', err);
    throw new Error('Could not create Google Drive folder.');
  }
}
