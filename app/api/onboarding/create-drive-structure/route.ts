
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGoogleDriveService } from '@/app/services/googleDrive';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Denna endpoint är skyddad och kräver en aktiv NextAuth-session.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Hämta användarens företagsuppgifter från Firestore för att namnge mappen.
    const db = getFirestore();
    const userDocRef = doc(db, 'users', session.user.id);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        return NextResponse.json({ success: false, error: 'User not found in Firestore' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    const companyName = userData.company?.name || 'Mitt Företag';
    const rootFolderName = `ByggPilot - ${companyName}`;

    // Hämta en autentiserad Google Drive-klient
    const drive = await getGoogleDriveService(session.user.id);
    if (!drive) {
        return NextResponse.json({ success: false, error: 'Could not authenticate with Google Drive' }, { status: 500 });
    }

    // 1. Skapa rotmappen
    const rootFolder = await drive.files.create({
        requestBody: {
            name: rootFolderName,
            mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
    });

    const rootFolderId = rootFolder.data.id;
    if (!rootFolderId) {
        throw new Error('Failed to create root folder.');
    }

    // 2. Definiera och skapa undermapparna
    const subFolders = [
      '01 Projekt', 
      '02 Kunder', 
      '03 Offerer', 
      '04 Fakturor', 
      '05 Dokumentmallar', 
      '06 Leverantörsfakturor'
    ];

    for (const folderName of subFolders) {
      await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolderId],
        },
      });
    }

    return NextResponse.json({ success: true, folderId: rootFolderId, folderName: rootFolderName });

  } catch (error) {
    console.error('[API-ERROR] create-drive-structure:', error);
    // Skicka ett mer informativt felmeddelande till klienten om möjligt
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
