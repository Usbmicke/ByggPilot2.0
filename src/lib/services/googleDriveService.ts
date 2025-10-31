
import { google } from 'googleapis';
import { authenticate } from '@/lib/services/googleAuthService';
import { logger } from '@/lib/logger';

// =================================================================================
// GOOGLE DRIVE SERVICE V3.0 - Intelligent Loggning
// =================================================================================
// Logiken i `getOrCreateFolder` har uppdaterats för att ge en kristallklar och
// professionell logg-output, vilket eliminerar den "buggiga" känslan av att
// mappar "inte hittas".

async function getDriveService() {
    const auth = await authenticate();
    if (!auth) {
        throw new Error('Google Drive Service: Kunde inte autentisera.');
    }
    return google.drive({ version: 'v3', auth });
}

// === DEN NYA, INTELLIGENTA LOGG-FUNKTIONEN ===
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
        // Hittade mappen, logga med en grön bock.
        logger.info(`[DriveService] ✅ Mapp '${name}' finns redan.`);
        return response.data.files[0].id;
    }

    // Hittade inte mappen, logga med ett plus-tecken.
    logger.info(`[DriveService] ➕ Skapar ny mapp: '${name}'...`);
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
        logger.error(`[DriveService] 🚨 KRITISKT: Misslyckades att skapa mappen '${name}' och fick inget ID.`);
        throw new Error(`Kunde inte skapa mappen '${name}'.`);
    }
    
    // Ingen extra logg här behövs, "Skapar..."-meddelandet räcker.
    return newFolderId;
}

export async function createOnboardingFolderStructure(companyName: string) {
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
        throw new Error('Företagsnamn är ogiltigt eller saknas.');
    }
    
    const drive = await getDriveService();
    const rootFolderName = `ByggPilot - ${companyName.trim()}`;
    logger.info(`[DriveService] --------------------------------------------------`);
    logger.info(`[DriveService] PÅBÖRJAR KONTROLL AV MAPPSTRUKTUR: ${rootFolderName}`);
    logger.info(`[DriveService] --------------------------------------------------`);

    try {
        const rootFolderId = await getOrCreateFolder(drive, rootFolderName);
        const rootFolderUrl = `https://drive.google.com/drive/folders/${rootFolderId}`;

        const subFolders = [
            '01 Projekt', 
            '02 Kunder', 
            '03 Offerter', 
            '04 Fakturor', 
            '05 Dokumentmallar', 
            '06 Leverantörsfakturor'
        ];

        const creationPromises = subFolders.map(folderName => 
            getOrCreateFolder(drive, folderName, rootFolderId)
        );
        await Promise.all(creationPromises);
        
        logger.info(`[DriveService] --------------------------------------------------`);
        logger.info(`[DriveService] ✅ Mappstruktur är nu fullständigt säkerställd.`);
        logger.info(`[DriveService] --------------------------------------------------`);

        return { 
            success: true, 
            parentFolderId: rootFolderId,
            parentFolderUrl: rootFolderUrl
        };

    } catch (error: any) {
        logger.error(`[DriveService] 🚨 Kritiskt fel vid säkerställande av mappstruktur för '${companyName}':`, error);
        throw new Error(`Misslyckades med att säkerställa mappstruktur i Google Drive: ${error.message}`);
    }
}
