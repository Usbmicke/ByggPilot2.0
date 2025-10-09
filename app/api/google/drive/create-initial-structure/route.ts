
import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/services/driveService';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { firestoreAdmin as firestore } from '@/lib/admin';

// =======================================================================
//  POST-metod: Skapar mappstruktur i Google Drive
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
        // 2. Hämta en autentiserad Google API-klient
        const auth = await getAuthenticatedClient(userId);
        if (!auth) {
            return NextResponse.json({ error: 'Kunde inte autentisera mot Google.' }, { status: 500 });
        }
        const drive = google.drive({ version: 'v3', auth });

        // 3. Definiera mappstrukturen
        const mainFolderName = `📁 ByggPilot - ${userDisplayName}`;
        const subFolders = [
            '1. Kunder',
            '2. Pågående Projekt',
            '3. Avslutade Projekt',
            '4. Företagsmallar',
            '5. Bokföringsunderlag'
        ];

        // 4. Skapa huvudmappen
        const mainFolder = await drive.files.create({
            requestBody: {
                name: mainFolderName,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
        });

        const mainFolderId = mainFolder.data.id;
        if (!mainFolderId) {
            throw new Error('Kunde inte skapa huvudmappen i Google Drive.');
        }

        // 5. Skapa undermapparna parallellt för effektivitet
        await Promise.all(
            subFolders.map(folderName => {
                return drive.files.create({
                    requestBody: {
                        name: folderName,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [mainFolderId],
                    },
                });
            })
        );

        // 6. Uppdatera användarens profil i Firestore
        const userDocRef = firestore.collection('users').doc(userId);
        await userDocRef.update({
            driveFolderStructureCreated: true,
        });

        // 7. Returnera ett framgångsmeddelande
        return NextResponse.json({ success: true, message: 'Mappstruktur skapad.', folderId: mainFolderId });

    } catch (error) {
        console.error('Fel vid skapande av mappstruktur i Google Drive:', error);
        // Försök ge ett mer specifikt felmeddelande om möjligt
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel uppstod.';
        return NextResponse.json({ error: 'Internt serverfel', details: errorMessage }, { status: 500 });
    }
}
