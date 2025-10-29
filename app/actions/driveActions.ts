'use server';

import { google } from 'googleapis';
import { logger } from '@/lib/logger';

// =================================================================================
// DRIVE ACTIONS V1.1 - FÖRBÄTTRAD DIAGNOSTIK
// =================================================================================

// --- HJÄLPFUNKTIONER ---

function getGoogleAuthFromToken(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

function getDriveClient(auth: any) {
    return google.drive({ version: 'v3', auth });
}

async function createSingleFolderWithClient(drive: any, name: string, parentId?: string): Promise<{ id: string; webViewLink: string; }> {
    const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] }),
    };
    const file = await drive.files.create({ resource: fileMetadata, fields: 'id, webViewLink' });
    if (!file.data.id || !file.data.webViewLink) throw new Error('Mapp-ID eller webViewLink saknas från Drive API-svar.');
    return { id: file.data.id, webViewLink: file.data.webViewLink };
}

// --- HUVUDFUNKTION ---

export async function createInitialFolderStructure(accessToken: string, companyName: string): Promise<{ rootFolderId: string; rootFolderUrl: string; subFolderIds: Record<string, string>; }> {
    logger.info(`[DriveActions] Startar mappstruktur för företag: "${companyName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        const rootFolderName = `ByggPilot - ${companyName}`;
        const _createFolderInternal = (name: string, parentId?: string) => createSingleFolderWithClient(drive, name, parentId);

        const { id: rootFolderId, webViewLink: rootFolderUrl } = await _createFolderInternal(rootFolderName);
        logger.info(`[DriveActions] Rotmapp skapad: ${rootFolderName} (ID: ${rootFolderId})`);

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
            const { id: folderId } = await _createFolderInternal(folderName, rootFolderId);
            subFolderIds[key] = folderId;
        });

        await Promise.all(creationPromises);
        
        logger.info(`[DriveActions] Undermappar skapade i ${rootFolderName}`);
        return { rootFolderId, rootFolderUrl, subFolderIds };

    } catch (error: any) {
        logger.error({ message: "[DriveActions] Allvarligt fel vid skapande av företagsstruktur", error: error, companyName });
        
        // MASTER PLAN-KORRIGERING: Extraherar specifikt felmeddelande från Google API.
        let detailedError = "Den initiala mappstrukturen för företaget kunde inte skapas.";
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
            detailedError = `Google Drive API-fel: ${error.errors[0].message}`;
        }

        throw new Error(detailedError);
    }
}
