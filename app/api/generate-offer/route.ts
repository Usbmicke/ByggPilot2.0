
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { authenticate } from '@/app/lib/google/auth';
import { findFolderIdByName } from '@/app/lib/google/driveService'; // Justerad sökväg
import { Readable } from 'stream';


async function getDriveService() {
    const auth = await authenticate();
    return google.drive({ version: 'v3', auth });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { offerDetails } = body;
        
        if (!offerDetails) {
            return NextResponse.json({ error: 'Offertdetaljer saknas' }, { status: 400 });
        }

        // Generera offertinnehåll (exempel)
        const offerContent = `
            <h1>Offert för ${offerDetails.customerName}</h1>
            <p><strong>Projekt:</strong> ${offerDetails.projectName}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
            <hr />
            <h2>Arbetsbeskrivning</h2>
            <p>${offerDetails.workDescription}</p>
            <h2>Prisuppskattning</h2>
            <p>${offerDetails.priceEstimate} SEK</p>
            <hr />
            <p>Tack för förtroendet!</p>
        `;

        const drive = await getDriveService();
        const parentFolderId = await findFolderIdByName(drive, 'ByggPilot - Projekt');

        if (!parentFolderId) {
            return NextResponse.json({ error: 'Huvudmappen kunde inte hittas.' }, { status: 500 });
        }

        // Antag att du vill spara offerter i en undermapp, t.ex. "Offerter"
        const offerFolderId = await findFolderIdByName(drive, 'Offerter');
         if (!offerFolderId) {
            return NextResponse.json({ error: 'Mappen för offerter kunde inte hittas.' }, { status: 500 });
        }

        const fileName = `Offert_${offerDetails.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        const fileMetadata = {
            name: fileName,
            parents: [offerFolderId],
            mimeType: 'text/html'
        };
        
        const media = {
            mimeType: 'text/html',
            body: Readable.from(offerContent)
        };

        const createdFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        return NextResponse.json({ 
            success: true, 
            message: "Offerten har skapats och sparats i Google Drive.",
            fileLink: createdFile.data.webViewLink
        });

    } catch (error: any) {
        console.error("Fel vid skapande av offert:", error);
        return NextResponse.json({ error: `Serverfel: ${error.message}` }, { status: 500 });
    }
}
