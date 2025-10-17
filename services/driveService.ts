
'use server';

import { google } from 'googleapis';
import { env } from '@/config/env';
import { adminDb } from '@/lib/admin';

// =================================================================================
// DRIVE SERVICE V4.1 - Exporterar createSingleFolder och lägger till createGoogleDocFromTemplate
// =================================================================================

// --- HJÄLPFUNKTIONER (Privata förutom de exporterade) ---

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

// --- EXPORTERADE HJÄLPFUNKTIONER ---

export async function createSingleFolder(accessToken: string, name: string, parentId?: string): Promise<string> {
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);
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

export async function createGoogleDocFromTemplate(accessToken: string, templateDocId: string, newDocName: string, targetFolderId: string): Promise<{ id: string; webViewLink: string; }> {
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);
    try {
        const copyRequest = {
            name: newDocName,
            parents: [targetFolderId],
        };

        const copiedFile = await drive.files.copy({
            fileId: templateDocId,
            requestBody: copyRequest,
            fields: 'id, webViewLink',
        });

        if (!copiedFile.data.id || !copiedFile.data.webViewLink) {
            throw new Error('Kunde inte kopiera malldokumentet eller få en länk.');
        }

        return {
            id: copiedFile.data.id,
            webViewLink: copiedFile.data.webViewLink,
        };
    } catch (error) {
        throw new Error(`Kunde inte skapa dokument från mall: ${error instanceof Error ? error.message : String(error)}`);
    }
}


// --- HUVUDFUNKTIONER ---

/**
 * Skapar den initiala mappstrukturen för ett nytt FÖRETAGSKONTO.
 */
export async function createInitialFolderStructure(accessToken: string, companyName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    console.log(`[DriveService] Påbörjar skapande av mappstruktur för företag: "${companyName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        const rootFolderName = `ByggPilot - ${companyName}`;
        // Använder en intern hjälpfunktion för att undvika att skicka runt accessToken hela tiden
        const _createFolderInternal = (name: string, parentId?: string) => createSingleFolderWithClient(drive, name, parentId);

        const rootFolderId = await _createFolderInternal(rootFolderName);

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
            const folderId = await _createFolderInternal(folderName, rootFolderId);
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

// Intern version som återanvänder en befintlig Drive-klient
async function createSingleFolderWithClient(drive: any, name: string, parentId?: string): Promise<string> {
    const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] }),
    };
    const file = await drive.files.create({ resource: fileMetadata, fields: 'id' });
    if (!file.data.id) throw new Error('Mapp-ID saknas från Drive API-svar.');
    return file.data.id;
}

/**
 * Skapar mappstrukturen för ett nytt PROJEKT inuti "01 Projekt"-mappen.
 */
export async function createInitialProjectStructure(accessToken: string, userId: string, projectName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    console.log(`[DriveService] Påbörjar skapande av projektmapp för: "${projectName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const projectsRootFolderId = userData?.driveFolderIds?.projects;

        if (!projectsRootFolderId) {
            throw new Error(`Kunde inte hitta ID för projektmappen ("01 Projekt") för användare ${userId}.`);
        }
        
        const _createFolderInternal = (name: string, parentId?: string) => createSingleFolderWithClient(drive, name, parentId);

        const projectRootId = await _createFolderInternal(projectName, projectsRootFolderId);
        console.log(`[DriveService] Projektmapp "${projectName}" skapad med ID: ${projectRootId}`);

        const subFolderMappings = {
            images: "Bilder",
            documents: "Dokument",
            drawings: "Ritningar",
            protocols: "Protokoll",
            economy: "Ekonomi", // Lade till ekonomi-mappen här
        };

        const subFolderIds: Record<string, string> = {};
        const creationPromises = Object.entries(subFolderMappings).map(async ([key, folderName]) => {
            const folderId = await _createFolderInternal(folderName, projectRootId);
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
