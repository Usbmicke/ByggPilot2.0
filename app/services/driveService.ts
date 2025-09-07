
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Konfigurera autentiseringen. 
// Denna funktion använder ett Service Account för att agera för applikationens räkning.
// Notera: JSON-nyckeln måste lagras säkert, t.ex. som en miljövariabel.
const getAuthenticatedClient = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.');
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth: client });
};

/**
 * Skapar en mapp i Google Drive och returnerar dess ID.
 * @param name Mappens namn.
 * @param parentFolderId (Valfritt) ID för överliggande mapp.
 */
const createFolder = async (drive: any, name: string, parentFolderId: string | null = null) => {
  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] }),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });

  return response.data.id;
};

/**
 * Skapar en standardiserad projektmappstruktur i Google Drive.
 * @param projectName Namnet på projektet.
 * @param customerName Kundens namn.
 * @returns ID för den skapade rotmappen för projektet.
 */
export async function createProjectFolder(projectName: string, customerName: string): Promise<string> {
  const drive = getAuthenticatedClient();

  // Steg 1: Skapa huvudmappen för projektet
  const mainFolderName = `${projectName} - ${customerName}`;
  // För enkelhetens skull antar vi en rotmapp att placera alla projekt i.
  // Denna måste skapas manuellt en gång och dess ID anges i en miljövariabel.
  const rootProjectsFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || null;

  const mainFolderId = await createFolder(drive, mainFolderName, rootProjectsFolderId);

  // Steg 2: Skapa undermappar
  const subfolders = [
    '01_Offert & Avtal',
    '02_Ritningar & Planer',
    '03_Bilder & Dokumentation',
    '04_Inköp & Material',
    '05_ÄTA',
    '06_Fakturaunderlag'
  ];

  // Skapa alla undermappar parallellt för effektivitet
  await Promise.all(
    subfolders.map(folderName => createFolder(drive, folderName, mainFolderId))
  );

  console.log(`Successfully created project folder '${mainFolderName}' with ID: ${mainFolderId}`);

  // Steg 3: Returnera ID för huvudmappen
  return mainFolderId;
}
