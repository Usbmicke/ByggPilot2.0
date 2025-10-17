
'use server';

import { google } from 'googleapis';
import { env } from '@/config/env';
import { adminDb } from '@/lib/admin'; // Importera adminDb

// =================================================================================
// DRIVE SERVICE V4.0 - ÅTERSKAPAD OCH KOMPLETT
// Inkluderar både företags- och projektmapps-logik.
// =================================================================================

// --- HJÄLPFUNKTIONER (Privata) ---

function getGoogleAuthFromToken(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

function getDriveClient(auth: any) {
    return google.drive({ version: 'v3', auth });
}

export async function createSingleFolder(drive: any, name: string, parentId?: string): Promise<string> {
    try {
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
            throw new Error('Drive API returnerade inget ID efter mappskapande.');
        }
        return file.data.id;
    } catch (error) {
        throw new Error(`Kunde inte skapa mapp "${name}": ${error instanceof Error ? error.message : String(error)}`);
    }
}

// --- PUBLIKA SERVICE-FUNKTIONER ---

/**
 * Skapar den initiala mappstrukturen för ett nytt FÖRETAGSKONTO.
 */
export async function createInitialFolderStructure(accessToken: string, companyName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    console.log(`[DriveService] Påbörjar skapande av mappstruktur för företag: "${companyName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        const rootFolderName = `ByggPilot - ${companyName}`;
        const rootFolderId = await createSingleFolder(drive, rootFolderName);

        const folderMappings = {
            projects: "01 Projekt",
            customers: "02 Kunder",
            offers: "03 Offerer",
            invoices: "04 Fakturor",
            templates: "05 Dokumentmallar",
            supplierInvoices: "06 Leverantörsfakturor",
        };

        const subFolderIds: Record<string, string> = {};
        const creationPromises = Object.entries(folderMappings).map(async ([key, folderName]) => {
            const folderId = await createSingleFolder(drive, folderName, rootFolderId);
            subFolderIds[key] = folderId;
        });

        await Promise.all(creationPromises);
        
        console.log(`[DriveService] Huvudmappar skapade i ${rootFolderName}`);
        return { rootFolderId, subFolderIds };

    } catch (error) {
        console.error("[DriveService] Fel vid skapande av företagsstruktur:", error);
        throw new Error("Den initiala mappstrukturen för företaget kunde inte skapas.");
    }
}


/**
 * Skapar mappstrukturen för ett nytt PROJEKT inuti "01 Projekt"-mappen.
 */
export async function createInitialProjectStructure(accessToken: string, userId: string, projectName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    console.log(`[DriveService] Påbörjar skapande av projektmapp för: "${projectName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        // Hämta ID för "01 Projekt"-mappen från användarens Firestore-dokument
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const projectsRootFolderId = userData?.driveFolderIds?.projects;

        if (!projectsRootFolderId) {
            throw new Error(`Kunde inte hitta ID för projektmappen ("01 Projekt") för användare ${userId}.`);
        }
        
        // Skapa projektets rotmapp
        const projectRootId = await createSingleFolder(drive, projectName, projectsRootFolderId);
        console.log(`[DriveService] Projektmapp "${projectName}" skapad med ID: ${projectRootId}`);

        // Definiera och skapa undermappar för projektet
        const subFolderMappings = {
            images: "Bilder",
            documents: "Dokument",
            drawings: "Ritningar",
            protocols: "Protokoll",
        };

        const subFolderIds: Record<string, string> = {};
        const creationPromises = Object.entries(subFolderMappings).map(async ([key, folderName]) => {
            const folderId = await createSingleFolder(drive, folderName, projectRootId);
            subFolderIds[key] = folderId;
        });

        await Promise.all(creationPromises);

        console.log(`[DriveService] Undermappar skapade för projektet "${projectName}"`);
        return { rootFolderId: projectRootId, subFolderIds };

    } catch (error) {
        console.error(`[DriveService] Fel vid skapande av projektstruktur för "${projectName}":`, error);
        throw new Error("Mappstrukturen för projektet kunde inte skapas.");
    }
}


export { getDriveClient };
