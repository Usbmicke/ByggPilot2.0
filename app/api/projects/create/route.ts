
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/admin';
import { createInitialProjectStructure } from '@/services/driveService'; // Korrekt import
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const accessToken = session?.accessToken; // Hämta accessToken

    if (!userId || !accessToken) { // Validera även accessToken
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectName, customerId, projectNumber, projectDescription, startDate, endDate } = body;

        if (!projectName || !customerId || !projectNumber) {
            return NextResponse.json({ message: 'Projektnamn, kund och projektnummer krävs.' }, { status: 400 });
        }

        // Anropa den korrekta funktionen med alla nödvändiga argument
        const { rootFolderId, subFolderIds } = await createInitialProjectStructure(accessToken, userId, projectName);

        if (!rootFolderId || Object.keys(subFolderIds).length === 0) {
            throw new Error('Mappstrukturen kunde inte skapas i Google Drive.');
        }

        // Använd adminDb, vilket redan var korrekt här
        const newProjectRef = adminDb.collection('projects').doc();
        
        const newProjectData = {
            id: newProjectRef.id,
            userId: userId, // Spara userId för framtida referens
            projectName,
            customerId,
            projectNumber,
            projectDescription: projectDescription || '',
            startDate: startDate || '',
            endDate: endDate || '',
            status: 'active',
            createdAt: FieldValue.serverTimestamp(),
            googleDrive: {
                rootFolderId: rootFolderId,
                subFolderIds: subFolderIds,
            },
        };

        await newProjectRef.set(newProjectData);

        return NextResponse.json({ message: 'Projekt skapat!', projectId: newProjectRef.id, project: newProjectData }, { status: 201 });

    } catch (error) {
        console.error('Fel vid skapande av projekt:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt serverfel inträffade';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
