
import { google } from 'googleapis';
import { authenticate } from '@/app/lib/google/auth';
import { Project } from '@/app/types'; // Importera Project-typen

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
    folderId = response.data.id;
    console.log(`Skapade huvudmappen '${FÖRÄLDERMAPPNAMN}' med ID: ${folderId}`);
    return folderId;
}

export async function findFolderIdByName(drive: any, name: string): Promise<string | null> {
    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
    });
    if (response.data.files.length > 0) {
        return response.data.files[0].id;
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
        console.log(`Skapade mappen '${name}' med ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error(`Fel vid skapande av mapp '${name}':`, error);
        throw error;
    }
}

// VÄRLDSKLASS-KORRIGERING: Funktionen tar nu ett projectName och är korrekt exporterad.
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

// VÄRLDSKLASS-KORRIGERING: En ny funktion för att synka hela projektet.
export async function synchronizeProjectWithGoogleDrive(project: Project) {
    if (!project || !project.name) {
        console.error("Projekt eller projektnamn saknas.");
        return { success: false, error: "Projektdata är ofullständig." };
    }

    console.log(`Synkroniserar projekt "${project.name}" med Google Drive...`);
    // VÄRLDSKLASS-KORRIGERING: Anropar den nu korrekta funktionen med rätt argument.
    return await createProjectFolderStructure(project.name);
}

