
import { drive_v3 } from 'googleapis';
import { getGoogleDriveService } from '@/lib/google';
import { Readable } from 'stream';

// =======================================================================
// GULDSTANDARD DRIVE SERVICE
// =======================================================================

/**
 * Skapar en ny mapp i Google Drive.
 */
export async function createFolder(userId: string, name: string, parentFolderId: string | null = null): Promise<drive_v3.Schema$File> {
    const drive = await getGoogleDriveService(userId);
    if (!drive) throw new Error('Kunde inte initialisera Google Drive-service.');

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
        if (!response.data) throw new Error("Fick inget svar från API vid skapande av mapp.");
        console.log(`[DriveService] Mapp "${name}" (ID: ${response.data.id}) skapades.`);
        return response.data as drive_v3.Schema$File;
    } catch (error) {
        console.error(`[DriveService] Fel vid skapande av mapp "${name}":`, error);
        throw new Error(`Misslyckades att skapa mappen '${name}'.`);
    }
};

/**
 * Söker efter eller skapar en undermapp och returnerar dess ID.
 */
export async function getOrCreateSubFolder(userId: string, parentFolderId: string, subFolderName: string): Promise<string> {
    const drive = await getGoogleDriveService(userId);
    if (!drive) throw new Error('Kunde inte initialisera Google Drive-service.');

    try {
        const query = `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${subFolderName}' and trashed = false`;
        const response = await drive.files.list({ q: query, fields: 'files(id, name)' });

        if (response.data.files && response.data.files.length > 0 && response.data.files[0].id) {
            console.log(`[DriveService] Hittade befintlig undermapp "${subFolderName}".`);
            return response.data.files[0].id;
        } else {
            console.log(`[DriveService] Skapar ny undermapp "${subFolderName}".`);
            const newFolder = await createFolder(userId, subFolderName, parentFolderId);
            if (!newFolder.id) throw new Error('Misslyckades med att få ID för nyskapad mapp.');
            return newFolder.id;
        }
    } catch (error) {
        console.error(`[DriveService] Fel vid hantering av undermapp "${subFolderName}":`, error);
        throw new Error(`Kunde inte hitta eller skapa undermappen '${subFolderName}'.`);
    }
}


/**
 * Laddar upp en fil till en specifik mapp i Google Drive.
 */
export async function uploadFileToDrive(userId: string, fileName: string, fileType: string, folderId: string, fileBuffer: Buffer): Promise<drive_v3.Schema$File> {
    const drive = await getGoogleDriveService(userId);
    if (!drive) throw new Error('Kunde inte initialisera Google Drive-service.');

    const media = {
        mimeType: fileType,
        body: Readable.from(fileBuffer),
    };
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });
        if (!response.data) throw new Error("Fick inget svar från API vid filuppladdning.");
        console.log(`[DriveService] Filen "${fileName}" (ID: ${response.data.id}) laddades upp.`);
        return response.data as drive_v3.Schema$File;
    } catch (error) {
        console.error(`[DriveService] Fel vid uppladdning av fil "${fileName}":`, error);
        throw new Error(`Misslyckades med att ladda upp filen '${fileName}'.`);
    }
}

/**
 * Skapar den initiala mappstrukturen för ett nytt projekt.
 */
export async function createInitialProjectStructure(userId: string, projectName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    try {
        const rootFolder = await createFolder(userId, `Projekt - ${projectName}`);
        const rootFolderId = rootFolder.id;
        if (!rootFolderId) throw new Error('Kunde inte skapa projektets rotmapp.');

        const subFolderNames = ['Ritningar', 'Bilder', 'Dokument', 'Avtal', 'ÄTA'];
        const subFolderIds: Record<string, string> = {};

        for (const name of subFolderNames) {
            const subFolder = await createFolder(userId, name, rootFolderId);
            if (subFolder.id) {
                subFolderIds[name.toLowerCase()] = subFolder.id;
            }
        }

        return { rootFolderId, subFolderIds };
    } catch (error) {
        console.error(`[DriveService] Allvarligt fel vid skapande av initial projektstruktur för "${projectName}":`, error);
        throw new Error('Kunde inte skapa hela mappstrukturen för projektet.');
    }
}

/**
 * Skapar den initiala mappstrukturen för en ny användare.
 */
export async function createInitialUserDriveStructure(userId: string, userDisplayName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    try {
        const mainFolderName = `📁 ByggPilot - ${userDisplayName}`;
        const rootFolder = await createFolder(userId, mainFolderName);
        const rootFolderId = rootFolder.id;
        if (!rootFolderId) throw new Error('Kunde inte skapa rotmappen för användaren.');

        const subFolderNames = [
            '1. Kunder',
            '2. Pågående Projekt',
            '3. Avslutade Projekt',
            '4. Företagsmallar',
            '5. Bokföringsunderlag'
        ];
        const subFolderIds: Record<string, string> = {};

        for (const name of subFolderNames) {
            const subFolder = await createFolder(userId, name, rootFolderId);
            if (subFolder.id) {
                const key = name.split('. ')[1].toLowerCase().replace(' ', '-');
                subFolderIds[key] = subFolder.id;
            }
        }
        console.log(`[DriveService] Initial mappstruktur skapad för användare ${userId}.`);
        return { rootFolderId, subFolderIds };

    } catch (error) {
        console.error(`[DriveService] Allvarligt fel vid skapande av initial användarstruktur för "${userId}":`, error);
        throw new Error('Kunde inte skapa hela mappstrukturen för användaren.');
    }
}
