
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin';
import { createInitialUserDriveStructure } from '@/services/driveService'; // Importera den nya centraliserade funktionen

// =======================================================================
//  POST-metod: Skapar mappstruktur i Google Drive (Refaktorerad)
// =======================================================================

export async function POST() {
    // 1. Hämta serversession för att identifiera användaren
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Autentisering krävs.' }, { status: 401 });
    }

    const userId = session.user.id;
    const userDisplayName = session.user.name || 'Okänt Företag';

    try {
        // 2. Anropa den centraliserade funktionen för att skapa mappstrukturen
        const { rootFolderId, subFolderIds } = await createInitialUserDriveStructure(userId, userDisplayName);

        if (!rootFolderId) {
             throw new Error('Kunde inte skapa huvudmappen i Google Drive.');
        }

        // 3. Uppdatera användarens profil i Firestore
        const userDocRef = adminDb.collection('users').doc(userId);
        await userDocRef.update({
            driveFolderStructureCreated: true,
            driveRootFolderId: rootFolderId, // Spara rotmappens ID
            driveSubFolderIds: subFolderIds, // Spara undermapparnas ID:n
        });

        // 4. Returnera ett framgångsmeddelande
        return NextResponse.json({ 
            success: true, 
            message: 'Mappstruktur skapad.', 
            folderId: rootFolderId 
        });

    } catch (error) {
        console.error('Fel vid skapande av mappstruktur i Google Drive:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel uppstod.';
        return NextResponse.json({ error: 'Internt serverfel', details: errorMessage }, { status: 500 });
    }
}
