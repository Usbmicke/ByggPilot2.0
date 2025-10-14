
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import { firestoreAdmin } from '@/lib/admin';
import { createInitialUserDriveStructure } from '@/lib/drive';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userDisplayName = session?.user?.name;

    if (!userId || !userDisplayName) {
        return NextResponse.json({ success: false, error: 'Not authenticated or user name is missing' }, { status: 401 });
    }

    try {
        const userDocRef = firestoreAdmin.collection('users').doc(userId);

        // Anropa den centraliserade funktionen för att skapa hela strukturen
        const { rootFolderId, subFolderIds } = await createInitialUserDriveStructure(userId, userDisplayName);

        if (!rootFolderId) {
            throw new Error('Misslyckades med att skapa rotmappen i Drive.');
        }

        const userDocSnap = await userDocRef.get();
        const userData = userDocSnap.data();

        // Uppdatera Firestore med den nya informationen
        await userDocRef.update({
            isNewUser: false, // Markera användaren som inte längre ny
            onboardingComplete: true, // Sätt onboarding som slutförd
            driveRootFolderId: rootFolderId,
            driveFolderIds: subFolderIds,
            onboardingStatus: {
                ...userData?.onboardingStatus,
                createdDriveStructure: true,
            }
        });

        console.log(`[API-SUCCESS] Drive-struktur skapad för ${userId} och onboarding markerad som slutförd.`);
        
        return NextResponse.json({ success: true, rootFolderId: rootFolderId });

    } catch (error) {
        console.error('[API-ERROR] create-drive-structure:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
