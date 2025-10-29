
import { google } from 'googleapis';
import { authenticate } from '@/lib/services/googleAuthService';
import { Project } from '@/app/types';
import { Readable } from 'stream';

const FÖRÄLDERMAPPNAMN = 'ByggPilot - Projekt';

// Helper to get an authenticated drive service instance
async function getDriveService() {
    const auth = await authenticate();
    return google.drive({ version: 'v3', auth });
}

// Reusable and robust function to find or create a folder
async function getOrCreateFolder(drive: any, name: string, parentId?: string): Promise<string> {
    let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
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
        console.log(`Hittade befintlig mapp '${name}' med ID: ${response.data.files[0].id}`);
        return response.data.files[0].id;
    }

    console.log(`Mapp '${name}' hittades inte, skapar ny...`);
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
        throw new Error(`Kunde inte skapa eller hitta ID för mappen '${name}'.`);
    }
    console.log(`Skapade mappen '${name}' med ID: ${newFolderId}`);
    return newFolderId;
}

export async function createProjectFolderStructure(projectName: string) {
    try {
        const drive = await getDriveService();
        const parentFolderId = await getOrCreateFolder(drive, FÖRÄLDERMAPPNAMN);
        const projectFolderId = await getOrCreateFolder(drive, projectName, parentFolderId);

        const subFolders = ['ÄTA', 'Tidrapporter', 'Protokoll', 'Fakturor', 'Bilder', 'Offerter'];
        for (const folderName of subFolders) {
            await getOrCreateFolder(drive, folderName, projectFolderId);
        }

        return { success: true, projectFolderId: projectFolderId };
    } catch (error: any) {
        console.error("[driveService] Fel vid skapande av projektstruktur:", error);
        return {
            success: false,
            error: `Internt serverfel: ${error.message}`
        };
    }
}

export async function synchronizeProjectWithGoogleDrive(project: Project) {
    if (!project || !project.projectName) {
        console.error("Projekt eller projektnamn saknas.");
        return { success: false, error: "Projektdata är ofullständig." };
    }

    console.log(`Synkroniserar projekt "${project.projectName}" med Google Drive...`);
    return await createProjectFolderStructure(project.projectName);
}

export async function createOfferFile(projectName: string, fileName: string, htmlContent: string) {
     try {
        const drive = await getDriveService();
        const parentFolderId = await getOrCreateFolder(drive, FÖRÄLDERMAPPNAMN);
        const projectFolderId = await getOrCreateFolder(drive, projectName, parentFolderId);
        const offerFolderId = await getOrCreateFolder(drive, 'Offerter', projectFolderId);

        const fileMetadata = {
            name: fileName,
            parents: [offerFolderId],
            mimeType: 'text/html'
        };
        
        const media = {
            mimeType: 'text/html',
            body: Readable.from(htmlContent)
        };

        const createdFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        if (!createdFile.data || !createdFile.data.webViewLink) {
             throw new Error('Filen skapades, men en länk kunde inte genereras.');
        }

        return { 
            success: true, 
            webViewLink: createdFile.data.webViewLink 
        };

    } catch (error: any) {
        console.error("[driveService] Fel vid skapande av offer-fil:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function uploadFileToProjectFolder(projectName: string, folderName: string, file: File) {
    try {
        const drive = await getDriveService();
        const parentFolderId = await getOrCreateFolder(drive, FÖRÄLDERMAPPNAMN);
        const projectFolderId = await getOrCreateFolder(drive, projectName, parentFolderId);
        const destinationFolderId = await getOrCreateFolder(drive, folderName, projectFolderId);

        const fileMetadata = {
            name: file.name,
            parents: [destinationFolderId]
        };

        const media = {
            mimeType: file.type,
            body: Readable.from(Buffer.from(await file.arrayBuffer()))
        };

        const createdFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });
        
        if (!createdFile.data || !createdFile.data.id) {
            throw new Error('Misslyckades med att skapa filen i Google Drive.');
        }

        return { 
            success: true, 
            fileId: createdFile.data.id, 
            webViewLink: createdFile.data.webViewLink 
        };

    } catch (error: any) {
        console.error(`[driveService] Fel vid uppladdning av fil till '${projectName}/${folderName}':`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

