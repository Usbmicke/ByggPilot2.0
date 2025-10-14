
'use server';

import { getGoogleAuth, getDriveClient } from '@/lib/google';

// =================================================================================
// DRIVE SERVICE V1.1 - LÄSFUNKTIONALITET
// BESKRIVNING: Utökad med `getDriveFileContent` för att möjliggöra läsning
// av filinnehåll, en kritisk del av den nya agent-arkitekturen.
// =================================================================================

/**
 * Listar filer i en specifik Google Drive-mapp.
 */
export async function listFiles(userId: string, folderId: string): Promise<{ id: string; name: string; }[]> {
    try {
        const auth = await getGoogleAuth(userId);
        const drive = getDriveClient(auth);

        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name)',
            pageSize: 100,
        });

        const files = res.data.files || [];
        return files.map(file => ({
            id: file.id || '',
            name: file.name || 'Namnlös fil',
        }));

    } catch (error) {
        console.error(`[DriveService] Fel vid listning av filer för användare ${userId} i mapp ${folderId}:`, error);
        throw new Error('Kunde inte lista filer från Google Drive.');
    }
}

/**
 * Hämtar innehållet i en specifik fil från Google Drive som text.
 * @param userId Användarens unika ID.
 * @param fileId ID för filen som ska läsas.
 * @returns Filens innehåll som en sträng.
 */
export async function getDriveFileContent(userId: string, fileId: string): Promise<string> {
    try {
        const auth = await getGoogleAuth(userId);
        const drive = getDriveClient(auth);

        const res = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'text' } // Begär svar som råtext
        );

        // Type guard för att säkerställa att res.data är en sträng
        if (typeof res.data === 'string') {
            return res.data;
        }

        // Om datan är i ett oväntat format, logga och kasta ett fel
        console.warn(`[DriveService] Oväntat dataformat för fil ${fileId}. Förväntade sträng, fick ${typeof res.data}.`);
        throw new Error('Filinnehållet kunde inte tolkas som text.');

    } catch (error) {
        console.error(`[DriveService] Fel vid läsning av fil ${fileId} för användare ${userId}:`, error);
        throw new Error(`Kunde inte läsa innehållet i fil med ID ${fileId}.`);
    }
}
