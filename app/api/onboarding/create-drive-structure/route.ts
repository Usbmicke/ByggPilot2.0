
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGoogleDriveService } from '@/app/lib/google';
import { firestoreAdmin } from '@/app/lib/firebase-admin';

// Denna endpoint är skyddad och kräver en aktiv NextAuth-session.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Hämta användarens företagsuppgifter från Firestore för att namnge mappen.
    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    // KORRIGERING: Använder .exists (property) istället för .exists() (funktion) för Admin SDK.
    if (!userDocSnap.exists) {
        return NextResponse.json({ success: false, error: 'User not found in Firestore' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    // Säkerställ att companyName inte är tomt eller odefinierat
    const companyName = userData?.company?.name?.trim();
    if (!companyName) {
        console.warn(`[API-WARN] Företagsnamn saknas för användare ${userId}. Använder fallback.`);
    }
    const rootFolderName = `ByggPilot - ${companyName || 'Mitt Företag'}`;

    // Hämta en autentiserad Google Drive-klient med den NYA, korrekta tjänsten
    const drive = await getGoogleDriveService(userId);
    if (!drive) {
        return NextResponse.json({ success: false, error: 'Could not authenticate with Google Drive. User may need to re-authenticate.' }, { status: 500 });
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
        throw new Error('Failed to create root folder in Google Drive.');
    }

    // 2. Definiera och skapa undermapparna
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

    // 3. När allt är klart, uppdatera användaren i databasen för att avsluta onboardingen.
    await userDocRef.update({
        onboardingCompleted: true,
        isNewUser: false, // Sätt isNewUser till false för att slutföra processen
        driveRootFolderId: rootFolderId,
        driveRootFolderName: rootFolderName
    });

    console.log(`[API-SUCCESS] Drive-struktur skapad och onboarding slutförd för användare ${userId}.`);
    return NextResponse.json({ success: true, folderId: rootFolderId, folderName: rootFolderName });

  } catch (error) {
    console.error('[API-ERROR] create-drive-structure:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
