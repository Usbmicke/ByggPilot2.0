
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { firestoreAdmin } from '@/lib/firebase-admin';
import { getAuthenticatedClient, createFolder, createGoogleDoc } from '@/services/driveService';
import { google } from 'googleapis';

// Hjälpfunktion för att hantera mappskapande och undvika kodupprepning
async function createAndGetFolder(drive: any, name: string, parentId: string): Promise<{ id: string; url: string }> {
    const folder = await createFolder(drive, name, parentId);
    if (!folder || !folder.id || !folder.webViewLink) {
        throw new Error(`Kunde inte skapa mappen: ${name}`);
    }
    return { id: folder.id, url: folder.webViewLink };
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // 1. Hämta användarens refreshToken från Firestore
        const userDocRef = firestoreAdmin.collection('users').doc(userId);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
            return NextResponse.json({ success: false, error: 'User not found in Firestore' }, { status: 404 });
        }

        const userData = userDocSnap.data();
        const refreshToken = userData?.googleRefreshToken;

        if (!refreshToken) {
            return NextResponse.json({ success: false, error: 'Missing Google refresh token for user.' }, { status: 400 });
        }

        // 2. Skapa en autentiserad Google Drive-klient
        const auth = getAuthenticatedClient(refreshToken);
        const drive = google.drive({ version: 'v3', auth });

        const companyName = userData?.company?.name?.trim() || 'Mitt Företag';
        const rootFolderName = `ByggPilot - ${companyName}`;

        // 3. Skapa rotmappen med det korrekta 'root'-ID:t
        const rootFolder = await createFolder(drive, rootFolderName, 'root');
        if (!rootFolder || !rootFolder.id || !rootFolder.webViewLink) {
            throw new Error('Kunde inte skapa rotmappen i Google Drive.');
        }
        const rootFolderId = rootFolder.id;
        const rootFolderUrl = rootFolder.webViewLink;

        // 4. Skapa undermappar och dokument med den autentiserade drive-klienten
        const foldersToCreate = {
            templates: '00_Företagsmallar',
            prospects: '01_Kunder & Anbud',
            active: '02_Pågående Projekt',
            archived: '03_Avslutade Projekt',
            companyEconomy: '04_Företagsekonomi',
        };

        const folderIds = {
            root: rootFolderId,
            templates: (await createAndGetFolder(drive, foldersToCreate.templates, rootFolderId)).id,
            prospects: (await createAndGetFolder(drive, foldersToCreate.prospects, rootFolderId)).id,
            active: (await createAndGetFolder(drive, foldersToCreate.active, rootFolderId)).id,
            archived: (await createAndGetFolder(drive, foldersToCreate.archived, rootFolderId)).id,
            companyEconomy: (await createAndGetFolder(drive, foldersToCreate.companyEconomy, rootFolderId)).id,
        };

        await createAndGetFolder(drive, 'Körjournaler', folderIds.companyEconomy);
        await createAndGetFolder(drive, 'Leverantörsfakturor (Ej projektspecifika)', folderIds.companyEconomy);

        const templateNames = [
            'Offertmall',
            'Avtalsmall_Hantverkarformuläret17',
            'Fakturaunderlag_mall'
        ];
        
        for (const name of templateNames) {
            await createGoogleDoc(drive, name, folderIds.templates);
        }

        // 5. Uppdatera Firestore med de nya ID:na och status
        await userDocRef.update({
            'googleDrive.rootFolderId': folderIds.root,
            'googleDrive.rootFolderName': rootFolderName,
            'googleDrive.rootFolderUrl': rootFolderUrl,
            'googleDrive.folderIds.templates': folderIds.templates,
            'googleDrive.folderIds.prospects': folderIds.prospects,
            'googleDrive.folderIds.active': folderIds.active,
            'googleDrive.folderIds.archived': folderIds.archived,
            'googleDrive.folderIds.companyEconomy': folderIds.companyEconomy,
            onboardingStatus: {
                ...userData?.onboardingStatus,
                createdDriveStructure: true,
            }
        });

        console.log(`[API-SUCCESS] Guldstandard Drive-struktur skapad för användare ${userId}.`);
        
        return NextResponse.json({ success: true, folderUrl: rootFolderUrl });

    } catch (error) {
        console.error('[API-ERROR] create-drive-structure:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
