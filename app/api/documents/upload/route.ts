
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToProjectFolder } from '@/lib/services/googleDriveService';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const projectName = formData.get('projectName') as string | null;
        const documentType = formData.get('documentType') as string | null; // e.g., 'Fakturor', 'Bilder'

        if (!file || !projectName || !documentType) {
            return NextResponse.json({ error: 'Nödvändig information saknas: fil, projektnamn eller dokumenttyp.' }, { status: 400 });
        }

        const result = await uploadFileToProjectFolder(projectName, documentType, file);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Något gick fel vid uppladdningen till Google Drive.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Filen har laddats upp till Google Drive.",
            fileLink: result.webViewLink
        });

    } catch (error: any) {
        console.error("Fel vid uppladdning till Drive:", error);
        return NextResponse.json({ error: `Serverfel: ${error.message}` }, { status: 500 });
    }
}
