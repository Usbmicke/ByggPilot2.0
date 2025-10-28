
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { authenticate } from '@/app/lib/google/auth';
import { findFolderIdByName } from '@/app/lib/google/driveService'; // Justerad sökväg

async function buffer(readable: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

async function getDriveService() {
    const auth = await authenticate();
    return google.drive({ version: 'v3', auth });
}


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const documentType = formData.get('documentType') as string;

        if (!file) {
            return NextResponse.json({ error: 'Ingen fil har laddats upp' }, { status: 400 });
        }

        const drive = await getDriveService();
        const parentFolderId = await findFolderIdByName(drive, 'ByggPilot - Projekt');

        if (!parentFolderId) {
            return NextResponse.json({ error: 'Huvudmappen kunde inte hittas i Google Drive' }, { status: 500 });
        }

        const documentFolderId = await findFolderIdByName(drive, documentType);

        if (!documentFolderId) {
             return NextResponse.json({ error: `Mappen för '${documentType}' kunde inte hittas.` }, { status: 500 });
        }

        const fileMetadata = {
            name: file.name,
            parents: [documentFolderId]
        };

        const media = {
            mimeType: file.type,
            body: Readable.from(Buffer.from(await file.arrayBuffer()))
        };

        await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        });

        return NextResponse.json({ success: true, message: "Filen har laddats upp till Google Drive." });
    } catch (error: any) {
        console.error("Fel vid uppladdning till Drive:", error);
        return NextResponse.json({ error: `Serverfel: ${error.message}` }, { status: 500 });
    }
}
