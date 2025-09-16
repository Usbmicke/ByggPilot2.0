import { google } from 'googleapis';

// TODO: Konfigurera OAuth2-klient med autentiseringsuppgifter från Google Cloud Console
// Detta kommer att kräva att du skapar ett nytt projekt i Google Cloud, aktiverar Drive API,
// och skapar nya autentiseringsuppgifter (Client ID och Client Secret).
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,      // Ersätt med ditt Client ID
  process.env.GOOGLE_CLIENT_SECRET,  // Ersätt med din Client Secret
  process.env.GOOGLE_REDIRECT_URI    // Ersätt med din Redirect URI
);

// TODO: Implementera logik för att hämta och lagra access/refresh tokens.
// Till exempel, när en användare autentiserar för första gången, sparas deras tokens i databasen.
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN // Ersätt med en användares refresh token
});

const drive = google.drive({
  version: 'v3',
  auth: oAuth2Client,
});

/**
 * Skapar en ny mapp i Google Drive.
 * 
 * @param folderName Namnet på mappen som ska skapas.
 * @param parentFolderId (Valfritt) ID:t för föräldramappen där den nya mappen ska skapas.
 * @returns Det skapade mappobjektet från Google Drive API.
 */
export async function createFolder(folderName: string, parentFolderId?: string) {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name',
    });

    console.log(`Mapp skapad med ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('Fel vid skapande av mapp i Google Drive:', error);
    throw new Error('Kunde inte skapa mappen i Google Drive.');
  }
}

// Fler funktioner för att interagera med Google Drive (ladda upp filer, lista filer etc.) kan läggas till här.
