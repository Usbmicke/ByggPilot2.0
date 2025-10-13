
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/admin';
import { createInitialProjectStructure } from '@/services/driveService';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectName, customerId, projectNumber, projectDescription, startDate, endDate } = body;

        if (!projectName || !customerId || !projectNumber) {
            return NextResponse.json({ message: 'Projektnamn, kund och projektnummer krävs.' }, { status: 400 });
        }

        const { rootFolderId, subFolderIds } = await createInitialProjectStructure(userId, projectName);

        if (!rootFolderId || Object.keys(subFolderIds).length === 0) {
            throw new Error('Mappstrukturen kunde inte skapas i Google Drive.');
        }

        const newProjectRef = adminDb.collection('users').doc(userId).collection('projects').doc();
        
        const newProjectData = {
            id: newProjectRef.id,
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
