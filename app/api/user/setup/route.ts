
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { createFolder, getGoogleAuth } from '@/app/services/driveService';
// Importerar `db`-instansen direkt istället för den felaktiga `updateUser`
import { db } from '@/app/services/firestoreService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    const accessToken = session?.accessToken;

    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if(userDoc.exists && userDoc.data()?.driveRootFolderId) {
        return NextResponse.json({ message: 'User setup already complete.' });
    }

    const auth = getGoogleAuth(accessToken);
    const folderName = "ByggPilot - Kundmapp";
    const folder = await createFolder(auth, folderName);

    if (!folder || !folder.id) {
        throw new Error('Failed to create root folder in Google Drive.');
    }

    const driveRootFolderId = folder.id;

    // KORRIGERING: Använder `db`-instansen för att uppdatera användaren direkt.
    await userRef.update({ driveRootFolderId: driveRootFolderId });

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
