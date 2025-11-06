
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToProjectFolder } from '@/lib/services/googleDriveService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.companyName) {
        return NextResponse.json({ error: 'Autentisering krävs och företagsnamn måste vara inställt.' }, { status: 401 });
    }
    const { companyName } = session.user;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const projectName = formData.get('projectName') as string | null;
        const documentType = formData.get('documentType') as string | null; 

        if (!file || !projectName || !documentType) {
            return NextResponse.json({ error: 'Nödvändig information saknas: fil, projektnamn eller dokumenttyp.' }, { status: 400 });
        }

        const result = await uploadFileToProjectFolder(companyName, projectName, documentType, file);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Något gick fel vid uppladdningen till Google Drive.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Filen har laddats upp till Google Drive.",
            fileLink: result.webViewLink
        });

    } catch (error: any) {
        logger.error({ message: "Fel vid uppladdning till Drive:", error: error.message });
        return NextResponse.json({ error: `Serverfel: ${error.message}` }, { status: 500 });
    }
}
