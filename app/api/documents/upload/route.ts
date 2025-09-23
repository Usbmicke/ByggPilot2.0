
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { getProject } from '@/app/services/projectService';
import { createFileInDrive } from '@/app/services/driveService'; // Denna service behöver skapas/verifieras
import { addFileToProject } from '@/app/services/firestoreService'; // Denna funktion behöver skapas

export async function POST(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const projectId = formData.get('projectId') as string | null;

        if (!file || !projectId) {
            return NextResponse.json({ message: 'Fil och projekt-ID krävs' }, { status: 400 });
        }

        // 1. Verifiera att användaren äger projektet
        const project = await getProject(projectId, userId);
        if (!project) {
            return NextResponse.json({ message: 'Åtkomst nekad till projektet' }, { status: 403 });
        }

        // 2. Ladda upp filen till Google Drive
        // Vi antar att projektet har en driveFolderId
        const driveFolderId = project.driveFolderId;
        if (!driveFolderId) {
             return NextResponse.json({ message: 'Projektets molnmapp kunde inte hittas.' }, { status: 500 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const driveFile = await createFileInDrive(file.name, file.type, driveFolderId, fileBuffer);

        if (!driveFile || !driveFile.id) {
            throw new Error('Misslyckades med att ladda upp filen till Google Drive');
        }

        // 3. Skapa en filreferens i Firestore
        const fileMetadata = {
            id: driveFile.id, // Google Drive file ID
            name: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            driveWebViewLink: driveFile.webViewLink, // Länk för att se filen
            driveIconLink: driveFile.iconLink, // Ikon för filtypen
        };

        await addFileToProject(projectId, fileMetadata);

        // 4. Returnera ett framgångsrikt svar
        return NextResponse.json({ message: 'Filen har laddats upp!', file: fileMetadata }, { status: 201 });

    } catch (error) {
        console.error('Fel vid filuppladdning:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt serverfel inträffade';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
