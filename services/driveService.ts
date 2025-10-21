
'use server';

import { google } from 'googleapis';
import { db } from '@/lib/db'; // <-- KORREKT DATABASANSLUTNING
import { logger } from '@/lib/logger';

// =================================================================================
// DRIVE SERVICE V5.0 - PLATINUM STANDARD
// REVIDERING: Fullständig sanering. All användning av `adminDb` är borttagen och
// ersatt med den korrekta, standardiserade `db`-anslutningen. Detta löser den
// grundläggande `initializeApp()`-kraschen. Hämtar nu även `webViewLink` för
// en bättre användarupplevelse.
// =================================================================================

// --- HJÄLPFUNKTIONER ---

// Skapar en autentiserad OAuth2-klient från en accessToken.
function getGoogleAuthFromToken(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

// Skapar en Drive API-klient.
function getDriveClient(auth: any) {
    return google.drive({ version: 'v3', auth });
}

// --- EXPORTERADE HJÄLPFUNKTIONER ---

/**
 * Skapar en enskild mapp i Google Drive.
 * Returnerar mappens ID och dess webblänk.
 */
export async function createSingleFolder(accessToken: string, name: string, parentId?: string): Promise<{ id: string; webViewLink: string; }> {
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
            fields: 'id, webViewLink', // Begär även webViewLink
        });

        if (!file.data.id || !file.data.webViewLink) {
            throw new Error('Drive API returnerade inte ID och webViewLink efter mappskapande.');
        }
        return { id: file.data.id, webViewLink: file.data.webViewLink };
    } catch (error) {
        logger.error({ message: `Kunde inte skapa Drive-mapp "${name}"`, error });
        throw new Error(`Kunde inte skapa mapp "${name}".`);
    }
}

// --- HUVUDFUNKTIONER ---

/**
 * Skapar den initiala mappstrukturen för ett nytt FÖRETAGSKONTO.
 * Returnerar ID och URL för rotmappen samt ID:n för undermapparna.
 */
export async function createInitialFolderStructure(accessToken: string, companyName: string): Promise<{ rootFolderId: string; rootFolderUrl: string; subFolderIds: Record<string, string>; }> {
    logger.info(`[DriveService] Startar mappstruktur för företag: "${companyName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        const rootFolderName = `ByggPilot - ${companyName}`;
        const _createFolderInternal = (name: string, parentId?: string) => createSingleFolderWithClient(drive, name, parentId);

        const { id: rootFolderId, webViewLink: rootFolderUrl } = await _createFolderInternal(rootFolderName);
        logger.info(`[DriveService] Rotmapp skapad: ${rootFolderName} (ID: ${rootFolderId})`);

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
        
        logger.info(`[DriveService] Undermappar skapade i ${rootFolderName}`);
        return { rootFolderId, rootFolderUrl, subFolderIds };

    } catch (error) {
        logger.error({ message: "[DriveService] Allvarligt fel vid skapande av företagsstruktur", error, companyName });
        throw new Error("Den initiala mappstrukturen för företaget kunde inte skapas.");
    }
}

// Intern version som återanvänder en befintlig Drive-klient.
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

/**
 * Skapar mappstrukturen för ett nytt PROJEKT.
 * Använder nu den korrekta `db`-anslutningen.
 */
export async function createInitialProjectStructure(accessToken: string, userId: string, projectName: string): Promise<{ rootFolderId: string; subFolderIds: Record<string, string>; }> {
    logger.info(`[DriveService] Startar projektmapp för: "${projectName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        // ANVÄNDER KORREKT DB-ANSLUTNING
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const projectsRootFolderId = userData?.googleDrive?.folderIds?.projects;

        if (!projectsRootFolderId) {
            logger.error(`[DriveService] Kunde inte hitta projektmapp-ID för användare ${userId}`);
            throw new Error(`Kunde inte hitta ID för projektmappen ("01 Projekt").`);
        }
        
        const _createFolderInternal = (name: string, parentId?: string) => createSingleFolderWithClient(drive, name, parentId);

        const { id: projectRootId } = await _createFolderInternal(projectName, projectsRootFolderId);
        logger.info(`[DriveService] Projektmapp "${projectName}" skapad med ID: ${projectRootId}`);

        const subFolderMappings = {
            images: "Bilder",
            documents: "Dokument",
            drawings: "Ritningar",
            protocols: "Protokoll",
            economy: "Ekonomi",
        };

        const subFolderIds: Record<string, string> = {};
        const creationPromises = Object.entries(subFolderMappings).map(async ([key, folderName]) => {
            const { id: folderId } = await _createFolderInternal(folderName, projectRootId);
            subFolderIds[key] = folderId;
        });

        await Promise.all(creationPromises);

        logger.info(`[DriveService] Undermappar skapade för projektet "${projectName}"`);
        return { rootFolderId: projectRootId, subFolderIds };

    } catch (error) {
        logger.error({ message: `[DriveService] Fel vid skapande av projektstruktur för "${projectName}"`, error, userId });
        throw new Error("Mappstrukturen för projektet kunde inte skapas.");
    }
}
