
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { db } from '@/app/services/firestoreService';
import { doc, updateDoc, FieldValue } from 'firebase/firestore';

// =======================================================================
// AUTHENTICATION
// =======================================================================

const getAuthenticatedClient = (refreshToken: string) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.');
  }
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
};

// =======================================================================
// DRIVE API FUNCTIONS
// =======================================================================

export const createFolder = async (drive: drive_v3.Drive, name: string, parentFolderId: string | null = null): Promise<string> => {
  const fileMetadata: drive_v3.Params$Resource$Files$Create['requestBody'] = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] }),
  };
  try {
    const response = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
    if (!response.data.id) {
        throw new Error("Could not create folder, no ID returned from API.");
    }
    console.log(`Successfully created folder "${name}" with ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error(`Error creating folder "${name}":`, error);
    throw new Error(`Failed to create folder '${name}' in Google Drive.`);
  }
};

/**
 * **NY FUNKTION**
 * Laddar upp en fil till en specifik mapp i Google Drive.
 */
export const createFileInDrive = async (fileName: string, mimeType: string, parentFolderId: string, fileBuffer: Buffer, refreshToken: string): Promise<drive_v3.Schema$File> => {
    const auth = getAuthenticatedClient(refreshToken);
    const drive = google.drive({ version: 'v3', auth });

    const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer),
    };

    const fileMetadata: drive_v3.Params$Resource$Files$Create['requestBody'] = {
        name: fileName,
        parents: [parentFolderId],
    };

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, mimeType, webViewLink, iconLink, size', // Hämta all metadata vi behöver
        });

        if (!response.data || !response.data.id) {
            throw new Error("No file data returned from Drive API after upload.");
        }
        
        console.log(`Successfully uploaded file "${fileName}" with ID: ${response.data.id}`);
        return response.data as drive_v3.Schema$File;

    } catch (error) {
        console.error(`Error uploading file "${fileName}":`, error);
        throw new Error(`Failed to upload file '${fileName}' to Google Drive.`);
    }
};

export async function createInitialProjectStructure(refreshToken: string): Promise<string> {
  const auth = getAuthenticatedClient(refreshToken);
  const drive = google.drive({ version: 'v3', auth });

  const rootFolderName = 'ByggPilot Projekt';
  const subfolders = [
    '01_Offert & Avtal',
    '02_Ritningar & Planer',
    '03_Bilder & Dokumentation',
    '04_Inköp & Material',
    '05_ÄTA (Ändringar, Tillägg, Avgående)',
    '06_Fakturaunderlag',
    'Arkiv'
  ];

  try {
    const rootFolderId = await createFolder(drive, rootFolderName, null);
    await Promise.all(subfolders.map(folderName => createFolder(drive, folderName, rootFolderId)));
    console.log(`Successfully created initial project structure under folder ID: ${rootFolderId}`);
    return rootFolderId;
  } catch (error) {
    console.error("Fatal error during initial project structure creation:", error);
    throw error; 
  }
}
