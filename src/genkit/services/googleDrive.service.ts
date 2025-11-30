
import 'server-only';
import { google } from 'googleapis';
import { adminAuth } from '../firebase'; // Importera adminAuth för framtida bruk

/**
 * Skapar en grundläggande mappstruktur för ett nytt företag i Google Drive.
 * OBS: Denna funktion kräver att användaren har gett tillåtelse (OAuth2 scopes) 
 * för att hantera filer i deras Google Drive. Autentiseringen behöver implementeras.
 *
 * @param companyName Namnet på företaget, används för att namnge rotmappen.
 * @param userAccessToken Användarens OAuth2 access token för Google Drive API.
 * @returns ID på den skapade rotmappen.
 */
async function createCompanyFolderStructure(companyName: string, userAccessToken: string): Promise<string> {
  
  // Konfigurera OAuth2-klienten med användarens token
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: userAccessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // 1. Skapa rotmappen för företaget
  const rootFolderMetadata = {
    name: `Byggpilot - ${companyName}`,
    mimeType: 'application/vnd.google-apps.folder',
  };
  const rootFolder = await drive.files.create({
    requestBody: rootFolderMetadata,
    fields: 'id',
  });
  const rootFolderId = rootFolder.data.id;

  if (!rootFolderId) {
    throw new Error('Kunde inte skapa rotmappen i Google Drive.');
  }

  // 2. Definiera och skapa undermappar
  const subFolders = [
    'Kunder',
    'Fakturor',
    'Dokumentation',
    'Projekt',
    'Bilder & Media'
  ];

  for (const folderName of subFolders) {
    const subFolderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    };
    await drive.files.create({ requestBody: subFolderMetadata });
  }
  
  console.log(`Mappstruktur skapad för ${companyName} med rotmapp-ID: ${rootFolderId}`);
  
  return rootFolderId;
}

export const googleDriveService = {
  createCompanyFolderStructure,
};
