
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Konfigurera autentiseringen. 
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
 * Skapar en mapp i Google Drive.
 */
const createFolder = async (drive: any, name: string, parentFolderId: string | null = null) => {
  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] }),
  };
  const response = await drive.files.create({ resource: fileMetadata, fields: 'id' });
  return response.data.id;
};

/**
 * Skapar en standardiserad projektmappstruktur i Google Drive.
 */
export async function createProjectFolder(projectName: string, customerName: string): Promise<string> {
  const drive = getAuthenticatedClient();
  const mainFolderName = `${projectName} - ${customerName}`;
  const rootProjectsFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || null;
  const mainFolderId = await createFolder(drive, mainFolderName, rootProjectsFolderId);

  const subfolders = [
    '01_Offert & Avtal',
    '02_Ritningar & Planer',
    '03_Bilder & Dokumentation',
    '04_Inköp & Material',
    '05_ÄTA',
    '06_Fakturaunderlag'
  ];

  await Promise.all(subfolders.map(folderName => createFolder(drive, folderName, mainFolderId)));
  console.log(`Successfully created project folder '${mainFolderName}' with ID: ${mainFolderId}`);
  return mainFolderId;
}

/**
 * Listar filer och mappar i en specifik Google Drive-mapp.
 * @param folderId ID för mappen att söka i.
 * @returns En lista med filer och mappar.
 */
export async function listFilesAndFolders(folderId: string): Promise<{ id: string; name: string; type: 'file' | 'folder' }[]> {
  if (!folderId) {
      throw new Error("No folderId provided to list files.");
  }

  const drive = getAuthenticatedClient();

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100, // Antal resultat per sida
    });

    const files = response.data.files || [];

    if (files.length === 0) {
        return [];
    }

    return files.map(file => ({
      id: file.id!,
      name: file.name!,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
    }));

  } catch (error) {
    console.error('Error listing files from Google Drive:', error);
    throw new Error('Could not list files from Google Drive.');
  }
}
