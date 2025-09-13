
import { google, drive_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Credentials } from 'google-auth-library';

// =======================================================================
// AUTHENTICATION HELPERS
// =======================================================================

/**
 * Skapar en Google Drive API-klient från en användares access token.
 * @param accessToken Användarens OAuth 2.0 access token.
 * @returns En autentiserad Google Drive API v3-klient.
 */
export const getGoogleAuth = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
};

/**
 * Skapar en Google Drive API-klient med ett servicekonto (för bakgrundsuppgifter).
 */
const getAuthenticatedClientWithServiceAccount = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.');
  }
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return client;
};

// =======================================================================
// DRIVE API FUNCTIONS
// =======================================================================

/**
 * Hittar en specifik undermapp inom en föräldermapp.
 * @param drive En autentiserad Drive API-klient.
 * @param parentFolderId ID för föräldermappen.
 * @param folderName Namnet på mappen att hitta.
 * @returns ID för den hittade mappen, annars null.
 */
export async function findFolderInParent(drive: drive_v3.Drive, parentFolderId: string, folderName: string): Promise<string | null> {
    const query = `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
    try {
        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            pageSize: 1,
        });
        if (response.data.files && response.data.files.length > 0) {
            return response.data.files[0].id || null;
        }
        return null;
    } catch (error) {
        console.error(`Error finding folder "${folderName}" in parent ${parentFolderId}:`, error);
        throw new Error('Could not search for folder in Google Drive.');
    }
}

/**
 * Skapar en mapp i Google Drive.
 */
export const createFolder = async (drive: drive_v3.Drive, name: string, parentFolderId: string | null = null): Promise<string> => {
  const fileMetadata: drive_v3.Params$Resource$Files$Create['requestBody'] = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] }),
  };
  const response = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
  if (!response.data.id) {
      throw new Error("Could not create folder, no ID returned.");
  }
  return response.data.id;
};

/**
 * Läser textinnehållet från en fil i Google Drive.
 */
export const readFileContent = async (drive: drive_v3.Drive, fileId: string): Promise<string> => {
    const fileMeta = await drive.files.get({ fileId: fileId, fields: 'mimeType, name' });
    const mimeType = fileMeta.data.mimeType;

    if (mimeType === 'application/vnd.google-apps.document') {
        const response = await drive.files.export({ fileId: fileId, mimeType: 'text/plain' }, { responseType: 'text' });
        return response.data as string;
    } else if (mimeType && mimeType.startsWith('text/') || mimeType === 'application/json') {
        const response = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'text' });
        return response.data as string;
    } else {
        if (mimeType === 'application/pdf') {
             throw new Error(`File type not supported yet: PDF files require OCR to read text content.`);
        }
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
};

/**
 * Skapar en standardiserad projektmappstruktur i Google Drive med ett servicekonto.
 */
export async function createProjectFolder(projectName: string, customerName: string): Promise<string> {
  const drive = google.drive({ version: 'v3', auth: getAuthenticatedClientWithServiceAccount() });
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
 */
export async function listFilesAndFolders(drive: drive_v3.Drive, folderId: string): Promise<{ id: string; name: string; type: 'file' | 'folder' }[]> {
  if (!folderId) {
      throw new Error("No folderId provided to list files.");
  }
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
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
