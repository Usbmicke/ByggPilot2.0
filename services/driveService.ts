
'use server';

import { google } from 'googleapis';
import { env } from '@/config/env';

// HJÄLPFUNKTION: Skapar en autentiserad Google-klient från en accessToken.
function getGoogleAuthFromToken(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

// HJÄLPFUNKTION: Skapar en Drive-klient.
function getDriveClient(auth: any) {
    return google.drive({ version: 'v3', auth });
}

/**
 * Skapar en ny mapp i Google Drive.
 * @param accessToken Användarens accessToken för Google API.
 * @param name Namnet på den nya mappen.
 * @param parentId ID på föräldramappen (valfritt).
 * @returns ID på den nyskapade mappen.
 */
export async function createFolder(accessToken: string, name: string, parentId?: string): Promise<string> {
    try {
        const auth = getGoogleAuthFromToken(accessToken);
        const drive = getDriveClient(auth);

        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentId && { parents: [parentId] }),
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });

        if (!file.data.id) {
            throw new Error('Fick inget ID tillbaka från Drive API efter att ha skapat mapp.');
        }

        return file.data.id;
    } catch (error) {
        console.error(`[DriveService] Fel vid skapande av mapp "${name}":`, error);
        throw new Error(`Kunde inte skapa mappen "${name}" i Google Drive.`);
    }
}

/**
 * Listar filer i en specifik Google Drive-mapp.
 */
export async function listFiles(accessToken: string, folderId: string): Promise<{ id: string; name: string; }[]> {
    try {
        const auth = getGoogleAuthFromToken(accessToken);
        const drive = getDriveClient(auth);

        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name)',
            pageSize: 100,
        });

        const files = res.data.files || [];
        return files.map(file => ({
            id: file.id || '',
            name: file.name || 'Namnlös fil',
        }));

    } catch (error) {
        console.error(`[DriveService] Fel vid listning av filer i mapp ${folderId}:`, error);
        throw new Error('Kunde inte lista filer från Google Drive.');
    }
}

/**
 * Hämtar innehållet i en specifik fil från Google Drive som text.
 */
export async function getDriveFileContent(accessToken: string, fileId: string): Promise<string> {
    try {
        const auth = getGoogleAuthFromToken(accessToken);
        const drive = getDriveClient(auth);

        const res = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'text' } 
        );

        if (typeof res.data === 'string') {
            return res.data;
        }

        console.warn(`[DriveService] Oväntat dataformat for fil ${fileId}.`);
        throw new Error('Filinnehållet kunde inte tolkas som text.');

    } catch (error) {
        console.error(`[DriveService] Fel vid läsning av fil ${fileId}:`, error);
        throw new Error(`Kunde inte läsa innehållet i fil med ID ${fileId}.`);
    }
}
