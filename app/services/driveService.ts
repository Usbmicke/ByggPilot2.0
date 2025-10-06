
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

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

const createFolder = async (drive: drive_v3.Drive, name: string, parentFolderId: string | null = null): Promise<drive_v3.Schema$File> => {
    const fileMetadata: drive_v3.Params$Resource$Files$Create['requestBody'] = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    try {
        const response = await drive.files.create({ 
            requestBody: fileMetadata, 
            fields: 'id, webViewLink' 
        });
        if (!response.data) {
            throw new Error("Could not create folder, no data returned from API.");
        }
        console.log(`Successfully created folder "${name}" with ID: ${response.data.id}`);
        return response.data as drive_v3.Schema$File;
    } catch (error) {
        console.error(`Error creating folder "${name}":`, error);
        throw new Error(`Failed to create folder '${name}' in Google Drive.`);
    }
};

const createGoogleDoc = async (drive: drive_v3.Drive, name: string, parentFolderId: string): Promise<drive_v3.Schema$File> => {
    const fileMetadata: drive_v3.Params$Resource$Files$Create['requestBody'] = {
        name: name,
        mimeType: 'application/vnd.google-apps.document',
        parents: [parentFolderId],
    };

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, webViewLink'
        });
        if (!response.data) {
            throw new Error("Could not create Google Doc, no data returned from API.");
        }
        console.log(`Successfully created Google Doc "${name}" with ID: ${response.data.id}`);
        return response.data as drive_v3.Schema$File;
    } catch (error) {
        console.error(`Error creating Google Doc "${name}":`, error);
        throw new Error(`Failed to create Google Doc '${name}' in Google Drive.`);
    }
};


export { getAuthenticatedClient, createFolder, createGoogleDoc };
