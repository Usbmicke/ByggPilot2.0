
import { google } from 'googleapis';
import { authenticate } from '@/app/lib/google/auth';
import { Project } from '@/app/types';

const FÖRÄLDERMAPPNAMN = 'ByggPilot - Projekt';

async function getOrCreateParentFolder(drive: any): Promise<string> {
    let folderId = await findFolderIdByName(drive, FÖRÄLDERMAPPNAMN);
    if (folderId) {
        console.log(`Hittade befintlig huvudmapp med ID: ${folderId}`);
        return folderId;
    }

    console.log(`Huvudmappen '${FÖRÄLDERMAPPNAMN}' hittades inte, skapar ny...`);
    const fileMetadata = {
        name: FÖRÄLDERMAPPNAMN,
        mimeType: 'application/vnd.google-apps.folder'
    };
    const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
    });
    const newFolderId = response.data.id;
    if (!newFolderId) {
        throw new Error('Kunde inte hämta ID för den nyskapade huvudmappen.');
    }
    console.log(`Skapade huvudmappen '${FÖRÄLDERMAPPNAMN}' med ID: ${newFolderId}`);
    return newFolderId;
}

export async function findFolderIdByName(drive: any, name: string): Promise<string | null> {
    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
    });
    if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id || null;
    } 
    return null;
}

async function createFolder(drive: any, name: string, parentId: string): Promise<string> {
    console.log(`Försöker skapa mapp: '${name}' inuti mapp-ID: ${parentId}`);
    const existingFolderId = await findFolderIdByName(drive, name);
    if(existingFolderId){
        console.log(`Mappen '${name}' finns redan med ID: ${existingFolderId}`);
        return existingFolderId;
    }

    const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
    };
    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        });
        const folderId = response.data.id;
        if (!folderId) {
             throw new Error(`Kunde inte skapa mappen '${name}'. Tomt ID returnerades.`);
        }
        console.log(`Skapade mappen '${name}' med ID: ${folderId}`);
        return folderId;
    } catch (error) {
        console.error(`Fel vid skapande av mapp '${name}':`, error);
        throw error;
    }
}

export async function createProjectFolderStructure(projectName: string) {
    try {
        const auth = await authenticate();
        const drive = google.drive({ version: 'v3', auth });

        const parentFolderId = await getOrCreateParentFolder(drive);
        const projectFolderId = await createFolder(drive, projectName, parentFolderId);

        const subFolders = ['ÄTA', 'Tidrapporter', 'Protokoll', 'Fakturor', 'Bilder'];
        for (const folderName of subFolders) {
            await createFolder(drive, folderName, projectFolderId);
        }

        return { success: true, projectFolderId: projectFolderId };
    } catch (error: any) {
        console.error("Ett fel inträffade i createProjectFolderStructure:", error);
        return {
            success: false,
            error: `Internt serverfel: ${error.message}`
        };
    }
}

// VÄRLDSKLASS-KORRIGERING: Använder nu 'projectName' för att matcha Project-typen.
export async function synchronizeProjectWithGoogleDrive(project: Project) {
    if (!project || !project.projectName) {
        console.error("Projekt eller projektnamn saknas.");
        return { success: false, error: "Projektdata är ofullständig." };
    }

    console.log(`Synkroniserar projekt "${project.projectName}" med Google Drive...`);
    return await createProjectFolderStructure(project.projectName);
}
