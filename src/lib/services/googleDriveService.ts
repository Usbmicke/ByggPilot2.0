
import { google } from 'googleapis';
import { Readable } from 'stream';
import { authenticate } from '@/lib/services/googleAuthService';
import { logger } from '@/lib/logger';


async function getDriveService() {
    const auth = await authenticate();
    if (!auth) {
        throw new Error('Google Drive Service: Kunde inte autentisera.');
    }
    return google.drive({ version: 'v3', auth });
}

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
        logger.info(`[DriveService] ✅ Mapp '${name}' finns redan.`);
        return response.data.files[0].id;
    }

    logger.info(`[DriveService] ➕ Skapar ny mapp: '${name}'...`);
    const fileMetadata: any = { name: name, mimeType: 'application/vnd.google-apps.folder' };
    if (parentId) {
        fileMetadata.parents = [parentId];
    }

    const createResponse = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
    const newFolderId = createResponse.data.id;
    if (!newFolderId) {
        logger.error({ message: `[DriveService] 🚨 KRITISKT: Misslyckades att skapa mappen '${name}' och fick inget ID.`});
        throw new Error(`Kunde inte skapa mappen '${name}'.`);
    }
    return newFolderId;
}

async function findRootFolder(drive: any, companyName: string): Promise<string | null> {
    const rootFolderName = `ByggPilot - ${companyName.trim()}`;
    const escapedName = rootFolderName.replace(/'/g, "\\'");
    const query = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`;
    
    const response = await drive.files.list({ q: query, fields: 'files(id)', pageSize: 1 });
    if (response.data.files && response.data.files.length > 0 && response.data.files[0].id) {
        return response.data.files[0].id;
    }
    return null;
}

export async function createOnboardingFolderStructure(companyName: string) {
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
        throw new Error('Företagsnamn är ogiltigt eller saknas.');
    }
    
    const drive = await getDriveService();
    const rootFolderName = `ByggPilot - ${companyName.trim()}`;
    logger.info(`[DriveService] PÅBÖRJAR KONTROLL AV MAPPSTRUKTUR: ${rootFolderName}`);

    try {
        const rootFolderId = await getOrCreateFolder(drive, rootFolderName);
        const rootFolderUrl = `https://drive.google.com/drive/folders/${rootFolderId}`;
        const subFolders = ['01 Projekt', '02 Kunder', '03 Offerter', '04 Fakturor', '05 Dokumentmallar', '06 Leverantörsfakturor'];
        await Promise.all(subFolders.map(folderName => getOrCreateFolder(drive, folderName, rootFolderId)));
        
        logger.info(`[DriveService] ✅ Mappstruktur är nu fullständigt säkerställd.`);
        return { success: true, parentFolderId: rootFolderId, parentFolderUrl: rootFolderUrl };
    } catch (error: any) {
        logger.error({ message: `[DriveService] 🚨 Kritiskt fel vid säkerställande av mappstruktur för '${companyName}'`, error });
        throw new Error(`Misslyckades med att säkerställa mappstruktur i Google Drive: ${error.message}`);
    }
}

export async function createOfferFile(companyName: string, projectName: string, fileName: string, offerContent: string) {
    try {
        const drive = await getDriveService();
        const rootFolderId = await findRootFolder(drive, companyName);
        if (!rootFolderId) throw new Error(`Kunde inte hitta rotmappen för företaget '${companyName}'.`);

        const offerFolderParent = await getOrCreateFolder(drive, '03 Offerter', rootFolderId);
        const projectOfferFolderId = await getOrCreateFolder(drive, projectName, offerFolderParent);

        const fileMetadata = { name: fileName, parents: [projectOfferFolderId] };
        const media = { mimeType: 'text/html', body: offerContent };
        const response = await drive.files.create({ requestBody: fileMetadata, media: media, fields: 'id, webViewLink' });
        
        logger.info({ message: `[DriveService] ✅ Offert '${fileName}' skapad i projektmappen '${projectName}'.`, link: response.data.webViewLink });
        return { success: true, webViewLink: response.data.webViewLink };
    } catch (error: any) {
        logger.error({ message: `[DriveService] 🚨 Fel vid skapande av offertfil för projekt '${projectName}'`, error });
        return { success: false, error: error.message };
    }
}

export async function uploadFileToProjectFolder(companyName: string, projectName: string, documentType: string, file: File) {
     try {
        const drive = await getDriveService();
        const rootFolderId = await findRootFolder(drive, companyName);
        if (!rootFolderId) throw new Error(`Kunde inte hitta rotmappen för företaget '${companyName}'.`);

        const projectsRootId = await getOrCreateFolder(drive, '01 Projekt', rootFolderId);
        const projectFolderId = await getOrCreateFolder(drive, projectName, projectsRootId);
        const documentTypeFolderId = await getOrCreateFolder(drive, documentType, projectFolderId);
        
        const buffer = await file.arrayBuffer();
        const readable = new Readable();
        readable._read = () => {};
        readable.push(Buffer.from(buffer));
        readable.push(null);

        const fileMetadata = { name: file.name, parents: [documentTypeFolderId] };
        const media = { mimeType: file.type, body: readable };
        const response = await drive.files.create({ requestBody: fileMetadata, media: media, fields: 'id, webViewLink' });

        logger.info({ message: `[DriveService] ✅ Fil '${file.name}' uppladdad till '${projectName}/${documentType}'.`, link: response.data.webViewLink });
        return { success: true, webViewLink: response.data.webViewLink };
    } catch (error: any) {
        logger.error({ message: `[DriveService] 🚨 Fel vid filuppladdning för projekt '${projectName}'`, error });
        return { success: false, error: error.message };
    }
}
