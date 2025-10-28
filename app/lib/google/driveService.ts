
import { google } from 'googleapis';
import { authenticate } from '@/app/lib/google/auth';

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
        throw error; // Kasta om felet för att hanteras av den anropande funktionen
    }
}

export async function createProjectFolderStructure() {
    try {
        const auth = await authenticate();
        const drive = google.drive({ version: 'v3', auth });
        console.log("Autentisering och Drive-klient skapad.");

        const parentFolderId = await getOrCreateParentFolder(drive);
        
        const grundmappar = ['ÄTA', 'Tidrapporter', 'Protokoll'];
        for (const mapp of grundmappar) {
            await createFolder(drive, mapp, parentFolderId);
        }

        console.log("Mappstruktur har skapats framgångsrikt i Google Drive.");
        return { success: true, message: "Mappstruktur skapad!" };
    } catch (error: any) {
        console.error("Ett fel inträffade i createProjectFolderStructure:", error);
        return {
            success: false,
            error: `Internt serverfel: ${error.message}`
        };
    }
}
