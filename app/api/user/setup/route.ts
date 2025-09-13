
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { createFolder, getGoogleAuth } from '@/app/services/driveService';
import { updateUser } from '@/app/services/firestoreService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    const accessToken = session?.accessToken;

    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Skapa rotmappen "ByggPilot" i användarens Google Drive
    const auth = getGoogleAuth(accessToken);
    const folderName = "ByggPilot";
    const folder = await createFolder(auth, folderName);

    if (!folder || !folder.id) {
        throw new Error('Failed to create root folder in Google Drive.');
    }

    const driveRootFolderId = folder.id;

    // Spara ID:t för den nya mappen i användarens dokument i Firestore
    await updateUser(userId, { driveRootFolderId: driveRootFolderId });

    return NextResponse.json({ 
        message: 'User setup complete. Root folder created.',
        driveRootFolderId: driveRootFolderId 
    });

  } catch (error) {
    console.error("Error in user setup API: ", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to complete user setup.', details: errorMessage }, { status: 500 });
  }
}
