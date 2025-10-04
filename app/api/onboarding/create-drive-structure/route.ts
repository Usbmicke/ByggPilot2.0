
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { getGoogleDriveService } from '@/lib/google';
import { firestoreAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
        return NextResponse.json({ success: false, error: 'User not found in Firestore' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    const companyName = userData?.company?.name?.trim();
    if (!companyName) {
        console.warn(`[API-WARN] Företagsnamn saknas för användare ${userId}. Använder fallback.`);
    }
    const rootFolderName = `ByggPilot - ${companyName || 'Mitt Företag'}`;

    const drive = await getGoogleDriveService(userId);
    if (!drive) {
        return NextResponse.json({ success: false, error: 'Could not authenticate with Google Drive.' }, { status: 500 });
    }

    const rootFolder = await drive.files.create({
        requestBody: {
            name: rootFolderName,
            mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id, webViewLink',
    });

    const rootFolderId = rootFolder.data.id;
    const rootFolderUrl = rootFolder.data.webViewLink;

    if (!rootFolderId || !rootFolderUrl) {
        throw new Error('Failed to create root folder or get its URL.');
    }

    const subFolders = [
      '01 Projekt', 
      '02 Kunder', 
      '03 Offerter', 
      '04 Fakturor', 
      '05 Dokumentmallar', 
      '06 Leverantörsfakturor'
    ];

    await Promise.all(subFolders.map(folderName => 
        drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [rootFolderId],
            },
        })
    ));

    // Uppdatera Firestore med enbart Drive-informationen. Onboarding-status hanteras separat.
    await userDocRef.update({
        driveRootFolderId: rootFolderId,
        driveRootFolderName: rootFolderName,
        driveRootFolderUrl: rootFolderUrl,
    });

    console.log(`[API-SUCCESS] Drive-struktur skapad för användare ${userId}.`);
    
    return NextResponse.json({ success: true, folderUrl: rootFolderUrl });

  } catch (error) {
    console.error('[API-ERROR] create-drive-structure:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
