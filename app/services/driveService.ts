'use client';

import { google, drive_v3 } from 'googleapis';

// =======================================================================
// AUTHENTICATION
// =======================================================================

/**
 * Skapar en fullständigt autentiserad Google API-klient (OAuth 2.0) 
 * från ett användarspecifikt refresh token.
 * Denna klient kan agera å användarens vägnar.
 * 
 * @param refreshToken Användarens refresh token från Firestore.
 * @returns En autentiserad google.auth.OAuth2-klient.
 */
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

/**
 * Skapar en mapp i en användares Google Drive.
 * 
 * @param drive En autentiserad Drive API-klient.
 * @param name Namnet på mappen som ska skapas.
 * @param parentFolderId (Valfritt) ID för föräldermappen. Om null, skapas den i roten.
 * @returns ID för den nyskapade mappen.
 */
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
 * Skapar ByggPilots initiala, standardiserade mappstruktur i en användares Google Drive.
 * Denna funktion är avsedd för "Zero State" / Onboarding.
 * 
 * @param refreshToken Användarens refresh token.
 * @returns ID för den rotmapp som skapades (t.ex. "ByggPilot Projekt").
 */
export async function createInitialProjectStructure(refreshToken: string): Promise<string> {
  // 1. Skapa en autentiserad klient för användaren.
  const auth = getAuthenticatedClient(refreshToken);
  const drive = google.drive({ version: 'v3', auth });

  // 2. Definiera mappstrukturen.
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
    // 3. Skapa rotmappen i användarens Drive.
    const rootFolderId = await createFolder(drive, rootFolderName, null);

    // 4. Skapa alla undermappar inuti rotmappen.
    // Promise.all används för att köra alla anrop parallellt för snabbhet.
    await Promise.all(subfolders.map(folderName => createFolder(drive, folderName, rootFolderId)));

    console.log(`Successfully created initial project structure under folder ID: ${rootFolderId}`);
    return rootFolderId;

  } catch (error) {
    console.error("Fatal error during initial project structure creation:", error);
    // Kasta om felet så att anropande API-route kan hantera det.
    throw error; 
  }
}
