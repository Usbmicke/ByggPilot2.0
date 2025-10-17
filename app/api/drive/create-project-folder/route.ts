
import { NextResponse } from 'next/server';
import { createInitialUserDriveStructure } from '@/services/driveService'; // KORRIGERAD IMPORT
import { adminAuth, adminDb } from '@/lib/admin';

/**
 * Skyddad API-slutpunkt för att skapa den initiala mappstrukturen 
 * för en ny användare under onboarding.
 */
export async function POST(request: Request) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is missing or invalid' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userDisplayName = decodedToken.name || 'Användare'; // Hämta display name

    // Anropa Drive-servicen för att skapa mappstrukturen
    const { rootFolderId, subFolderIds } = await createInitialUserDriveStructure(uid, userDisplayName);

    // Uppdatera användarens dokument i Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    await userDocRef.update({ 
      hasCompletedOnboarding: true,
      googleDrive: {
          rootFolderId: rootFolderId,
          folderIds: subFolderIds
      }
    });

    return NextResponse.json({ 
      message: 'Initial user structure created successfully in your Google Drive!',
      folderIds: { root: rootFolderId, ...subFolderIds } 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error during initial user structure creation:", error);

    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Invalid or expired authorization token' }, { status: 403 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
