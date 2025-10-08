
import { drive_v3 } from 'googleapis';
import { getGoogleDriveService } from '@/lib/google';

// =======================================================================
// GULDSTANDARD DRIVE SERVICE
// Denna service använder den centraliserade getGoogleDriveService för att 
// säkerställa konsekvent och korrekt autentisering för alla Google Drive-anrop.
// =======================================================================


/**
 * Skapar en ny mapp i Google Drive.
 * @param userId - ID för användaren som åtgärden utförs för.
 * @param name - Namnet på den nya mappen.
 * @param parentFolderId - Valfritt. ID för den överordnade mappen.
 * @returns Det skapade mappens filobjekt från Google Drive API.
 */
export async function createFolder(userId: string, name: string, parentFolderId: string | null = null): Promise<drive_v3.Schema$File> {
    const drive = await getGoogleDriveService(userId);
    if (!drive) {
        throw new Error('Kunde inte initialisera Google Drive-service.');
    }

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
            throw new Error("Kunde inte skapa mappen, fick inget svar från API:et.");
        }
        console.log(`[DriveService] Mappen "${name}" (ID: ${response.data.id}) skapades.`);
        return response.data as drive_v3.Schema$File;
    } catch (error) {
        console.error(`[DriveService] Fel vid skapande av mapp "${name}":`, error);
        throw new Error(`Misslyckades att skapa mappen '${name}' i Google Drive.`);
    }
};

/**
 * Skapar ett nytt Google-dokument.
 * @param userId - ID för användaren som åtgärden utförs för.
 * @param name - Namnet på det nya dokumentet.
 * @param parentFolderId - ID för den överordnade mappen.
 * @returns Det skapade dokumentets filobjekt från Google Drive API.
 */
export async function createGoogleDoc(userId: string, name: string, parentFolderId: string): Promise<drive_v3.Schema$File> {
    const drive = await getGoogleDriveService(userId);
    if (!drive) {
        throw new Error('Kunde inte initialisera Google Drive-service.');
    }
    
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
            throw new Error("Kunde inte skapa Google-dokumentet, fick inget svar från API:et.");
        }
        console.log(`[DriveService] Dokumentet "${name}" (ID: ${response.data.id}) skapades.`);
        return response.data as drive_v3.Schema$File;
    } catch (error) {
        console.error(`[DriveService] Fel vid skapande av Google-dokument "${name}":`, error);
        throw new Error(`Misslyckades att skapa Google-dokumentet '${name}'.`);
    }
};
