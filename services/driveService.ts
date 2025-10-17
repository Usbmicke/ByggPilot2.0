
'use server';

import { google } from 'googleapis';
import { env } from '@/config/env';

// =================================================================================
// DRIVE SERVICE V3.0 - GULDSTANDARD
// ARKITEKTUR: Isolerar all Google Drive-interaktion. Funktionerna är rena,
// tar emot `accessToken` som argument och innehåller ingen egen state. Detta
// gör dem extremt testbara och återanvändbara.
//
// FELHANTERING: Varje API-anrop är inkapslat i en `try...catch`-block med
// detaljerad, strukturerad loggning för omedelbar diagnostik.
// =================================================================================

// --- HJÄLPFUNKTIONER (Privata för modulen) ---

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

// --- PUBLIKA SERVICE-FUNKTIONER ---

/**
 * Skapar en enskild mapp i Google Drive.
 * @param drive En autentiserad Google Drive-klient.
 * @param name Namnet på den nya mappen.
 * @param parentId ID på föräldramappen (valfritt).
 * @returns ID på den nyskapade mappen.
 */
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
        // Ompaketera felet med mer kontext
        throw new Error(`Kunde inte skapa mapp "${name}": ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Skapar den initiala mappstrukturen för ett nytt företagskonto.
 * @param accessToken Användarens `accessToken` för Google API.
 * @param companyName Företagsnamnet som ska användas i rotmappens namn.
 * @returns ID på den skapade rotmappen.
 */
export async function createInitialFolderStructure(accessToken: string, companyName: string): Promise<string> {
    console.log(`[DriveService] Påbörjar skapande av mappstruktur för "${companyName}"`);
    const auth = getGoogleAuthFromToken(accessToken);
    const drive = getDriveClient(auth);

    try {
        // 1. Skapa rotmappen
        const rootFolderName = `ByggPilot - ${companyName}`;
        const rootFolderId = await createSingleFolder(drive, rootFolderName);
        console.log(`[DriveService] Rotmapp "${rootFolderName}" skapad med ID: ${rootFolderId}`);

        // 2. Definiera och skapa huvudmappar
        const mainFolders = ["01 Projekt", "02 Kunder", "03 Offerer", "04 Fakturor", "05 Dokumentmallar", "06 Leverantörsfakturor"];
        await Promise.all(mainFolders.map(folderName => 
            createSingleFolder(drive, folderName, rootFolderId)
        ));
        console.log(`[DriveService] Huvudmappar skapade i ${rootFolderName}`);

        return rootFolderId;

    } catch (error) {
        console.error("[DriveService] Allvarligt fel vid skapande av initial mappstruktur:", error);
        // Kasta ett nytt, mer informativt fel som kan fångas av anropande action
        throw new Error("Den initiala mappstrukturen i Google Drive kunde inte skapas.");
    }
}

export { getDriveClient };
