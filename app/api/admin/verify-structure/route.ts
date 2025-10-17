
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/admin';
import { getDriveClient, createSingleFolder as createFolder } from '@/services/driveService';

const GOLD_STANDARD_SUBFOLDERS = {
    avtal: '1_Avtal & Underlag',
    ekonomi: '2_Ekonomi',
    kma: '3_KMA',
    media: '4_Foton & Media'
};

async function verifyAndFix(userId: string, drive: any, parentFolderId: string, expectedFolderIds: Record<string, string>, expectedFolderNames: Record<string, string>): Promise<{ fixes: string[], updates: Record<string, string> }> {
    const fixes: string[] = [];
    const updates: Record<string, string> = {};

    for (const key in expectedFolderNames) {
        const folderId = expectedFolderIds[key];
        const folderName = expectedFolderNames[key];

        if (folderId) {
            try {
                await drive.files.get({ fileId: folderId, fields: 'id' });
            } catch (error) {
                fixes.push(`Mappen \"${folderName}\" (ID: ${folderId}) saknades och skapades på nytt.`);
                const newFolderId = await createFolder(drive, folderName, parentFolderId);
                updates[`googleDrive.subFolderIds.${key}`] = newFolderId;
            }
        } else {
            fixes.push(`Mapp-ID för \"${folderName}\" saknades i databasen och mappen har nu skapats.`);
            const newFolderId = await createFolder(drive, folderName, parentFolderId);
            updates[`googleDrive.subFolderIds.${key}`] = newFolderId;
        }
    }
    return { fixes, updates };
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const drive = await getDriveClient(session.accessToken);
        if (!drive) {
            return NextResponse.json({ error: 'Kunde inte ansluta till Google Drive.' }, { status: 500 });
        }

        let totalFixes: string[] = [];
        const userProjectsRef = adminDb.collection('users').doc(userId).collection('projects');
        const projectsSnapshot = await userProjectsRef.where('status', '==', 'Pågående').get();

        for (const doc of projectsSnapshot.docs) {
            const projectData = doc.data();
            const projectId = doc.id;

            if (projectData.status === 'Pågående' && projectData.googleDrive?.folderId) {
                const { fixes, updates } = await verifyAndFix(
                    userId, // Skicka med userId
                    drive,
                    projectData.googleDrive.folderId,
                    projectData.googleDrive.subFolderIds || {},
                    GOLD_STANDARD_SUBFOLDERS
                );

                if (fixes.length > 0) {
                    totalFixes = totalFixes.concat(fixes.map(f => `Projekt ${projectData.projectNumber || projectId}: ${f}`));
                    await userProjectsRef.doc(projectId).update(updates);
                }
            }
        }

        if (totalFixes.length === 0) {
            return NextResponse.json({ success: true, message: 'Verifiering slutförd. Allt ser bra ut! Inga fel hittades.', fixes: [] });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Verifiering slutförd. ${totalFixes.length} problem åtgärdades.`, 
            fixes: totalFixes 
        });

    } catch (error) {
        console.error('Fel vid verifiering av mappstruktur:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
