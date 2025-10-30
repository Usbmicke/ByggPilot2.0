
import { google } from 'googleapis';
import { authenticate } from '@/lib/services/googleAuthService'; // Moderniserad för att använda central autentisering
import { logger } from '@/lib/logger';

// Helper to get an authenticated drive service instance
async function getDriveService() {
    const auth = await authenticate();
    if (!auth) {
        throw new Error('Google Drive Service: Kunde inte autentisera.');
    }
    return google.drive({ version: 'v3', auth });
}

// GULDSTANDARD IDEMPOTENS: Hittar en mapp, eller skapar den om den inte finns.
async function getOrCreateFolder(drive: any, name: string, parentId?: string): Promise<string> {
    const escapedName = name.replace(/'/g, "\\'");
    let query = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    }
    
    const response = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
        pageSize: 1
    });

    if (response.data.files && response.data.files.length > 0 && response.data.files[0].id) {
        logger.info(`[DriveService] Hittade befintlig mapp '${name}' med ID: ${response.data.files[0].id}`);
        return response.data.files[0].id;
    }

    logger.info(`[DriveService] Mapp '${name}' hittades inte, skapar ny...`);
    const fileMetadata: any = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
        fileMetadata.parents = [parentId];
    }

    const createResponse = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
    });

    const newFolderId = createResponse.data.id;
    if (!newFolderId) {
        logger.error(`[DriveService] Kunde inte skapa eller hitta ID för mappen '${name}'.`);
        throw new Error(`Kunde inte skapa eller hitta ID för mappen '${name}'.`);
    }
    logger.info(`[DriveService] Skapade mappen '${name}' med ID: ${newFolderId}`);
    return newFolderId;
}

/**
 * GULDSTANDARD-FUNKTION V2: IDEMPOTENT & ROBUST
 * Skapar den fullständiga mappstrukturen. Denna funktion är nu fullständigt idempotent,
 * vilket innebär att den kan köras flera gånger utan att skapa dubbletter.
 */
export async function createOnboardingFolderStructure(companyName: string) {
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
        throw new Error('Företagsnamn är ogiltigt eller saknas.');
    }
    
    const drive = await getDriveService();
    const rootFolderName = `ByggPilot - ${companyName.trim()}`;
    logger.info(`[DriveService] Påbörjar säkerställande av mappstruktur för: ${rootFolderName}`);

    try {
        // ANVÄND IDEMPOTENT HJÄLPFUNKTION FÖR ROTMAPPEN
        const rootFolderId = await getOrCreateFolder(drive, rootFolderName);
        const rootFolderUrl = `https://drive.google.com/drive/folders/${rootFolderId}`;

        logger.info(`[DriveService] Rotmapp '${rootFolderName}' säkerställd med ID: ${rootFolderId}`);

        const subFolders = [
            '01 Projekt', 
            '02 Kunder', 
            '03 Offerter', 
            '04 Fakturor', 
            '05 Dokumentmallar', 
            '06 Leverantörsfakturor'
        ];

        // ANVÄND IDEMPOTENT HJÄLPFUNKTION FÖR ALLA UNDERMAPPAR PARALLELLT
        const creationPromises = subFolders.map(folderName => 
            getOrCreateFolder(drive, folderName, rootFolderId)
        );
        await Promise.all(creationPromises);
        
        logger.info(`[DriveService] Undermappar säkerställda för '${rootFolderName}'.`);

        return { 
            success: true, 
            parentFolderId: rootFolderId,
            parentFolderUrl: rootFolderUrl
        };

    } catch (error: any) {
        logger.error(`[DriveService] Kritiskt fel vid säkerställande av mappstruktur för '${companyName}':`, error);
        throw new Error(`Misslyckades med att säkerställa mappstruktur i Google Drive: ${error.message}`);
    }
}
