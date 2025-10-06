
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { firestoreAdmin } from '@/lib/firebase-admin';
import { createFolder, createGoogleDoc } from '@/services/driveService';

// Hjälpfunktion för att skapa en mapp och returnera dess ID
async function createAndGetFolderId(userId: string, name: string, parentId: string): Promise<string> {
    const folder = await createFolder(userId, name, parentId);
    if (!folder || !folder.id) {
        throw new Error(`Kunde inte skapa mappen: ${name}`);
    }
    return folder.id;
}

export async function POST(req: Request) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userDocRef = firestoreAdmin.collection('users').doc(userId);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
            return NextResponse.json({ success: false, error: 'User not found in Firestore' }, { status: 404 });
        }

        const userData = userDocSnap.data();
        // Använd befintlig logik för att hämta företagsnamn, med en fallback
        const companyName = userData?.company?.name?.trim() || 'Mitt Företag';
        const rootFolderName = `ByggPilot - ${companyName}`;

        // Skapa rotmappen
        const rootFolder = await createFolder(userId, rootFolderName);
        const rootFolderId = rootFolder?.id;
        const rootFolderUrl = rootFolder?.webViewLink;

        if (!rootFolderId || !rootFolderUrl) {
            throw new Error('Kunde inte skapa rotmappen i Google Drive.');
        }

        // --- GULDSTANDARD MAPPSTRUKTUR ---

        // Skapa huvudmapparna
        const foldersToCreate = {
            templates: '00_Företagsmallar',
            prospects: '01_Kunder & Anbud',
            active: '02_Pågående Projekt',
            archived: '03_Avslutade Projekt',
            companyEconomy: '04_Företagsekonomi',
        };

        const folderIds = {
            root: rootFolderId,
            templates: await createAndGetFolderId(userId, foldersToCreate.templates, rootFolderId),
            prospects: await createAndGetFolderId(userId, foldersToCreate.prospects, rootFolderId),
            active: await createAndGetFolderId(userId, foldersToCreate.active, rootFolderId),
            archived: await createAndGetFolderId(userId, foldersToCreate.archived, rootFolderId),
            companyEconomy: await createAndGetFolderId(userId, foldersToCreate.companyEconomy, rootFolderId),
        };

        // Skapa undermappar för Företagsekonomi
        await createAndGetFolderId(userId, 'Körjournaler', folderIds.companyEconomy);
        await createAndGetFolderId(userId, 'Leverantörsfakturor (Ej projektspecifika)', folderIds.companyEconomy);
        
        // Skapa standardmallar i "Företagsmallar"
        const templateNames = [
            'Offertmall',
            'Avtalsmall_Hantverkarformuläret17',
            'Fakturaunderlag_mall'
        ];
        
        for (const name of templateNames) {
            await createGoogleDoc(userId, name, folderIds.templates);
        }

        // --- SLUT PÅ GULDSTANDARD ---

        // Uppdatera Firestore med den nya, detaljerade mappstrukturen
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
