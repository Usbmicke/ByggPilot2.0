
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { firestoreAdmin } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { uploadFileToDrive, getOrCreateSubFolder } from '@/services/driveService';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const projectId = formData.get('projectId') as string | null;
        const destination = formData.get('destination') as string | null; 

        if (!file || !projectId || !destination) {
            return NextResponse.json({ message: 'Fil, projekt-ID och destination krävs' }, { status: 400 });
        }

        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            return NextResponse.json({ message: 'Åtkomst nekad eller så finns inte projektet' }, { status: 403 });
        }

        const projectData = projectDoc.data();
        if (!projectData?.googleDrive?.subFolderIds) {
             return NextResponse.json({ message: 'Projektets mappstruktur är ofullständig.' }, { status: 500 });
        }

        const destinationParts = destination.split('/');
        const mainDestination = destinationParts[0];
        const subFolderName = destinationParts.length > 1 ? destinationParts[1] : null;

        const mainFolderId = projectData.googleDrive.subFolderIds[mainDestination];
        if (!mainFolderId) {
             return NextResponse.json({ message: `Ogiltig huvud-destination: ${mainDestination}` }, { status: 400 });
        }
        
        let targetFolderId = mainFolderId;

        if (subFolderName) {
            targetFolderId = await getOrCreateSubFolder(userId, mainFolderId, subFolderName);
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const driveFile = await uploadFileToDrive(userId, file.name, file.type, targetFolderId, fileBuffer);

        if (!driveFile || !driveFile.id) {
            throw new Error('Misslyckades med att ladda upp filen till Google Drive');
        }

        const fileMetadata = {
            driveId: driveFile.id,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            destination: destination,
            uploadedAt: FieldValue.serverTimestamp(),
            driveWebViewLink: driveFile.webViewLink, 
        };

        await projectRef.collection('files').add(fileMetadata);

        return NextResponse.json({ message: 'Filen har laddats upp!', file: fileMetadata }, { status: 201 });

    } catch (error) {
        console.error('Fel vid filuppladdning:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt serverfel inträffade';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
