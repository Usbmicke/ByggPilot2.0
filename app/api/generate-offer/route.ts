
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { authenticate } from '@/app/lib/google/auth';
import { findFolderIdByName } from '@/app/lib/google/driveService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Readable } from 'stream';

const createOfferPrompt = (details: any) => {
    return `
        Du är en expert på att skriva offerter för ett svenskt byggföretag med namnet ByggPilot.
        Ditt mål är att skapa en professionell, välstrukturerad och förtroendeingivande offert i HTML-format.
        Använd en tydlig och vänlig ton. Svara ENDAST med HTML-koden för offerten, inget annat.

        Här är detaljerna för offerten som ska skapas:
        - Kundens namn: ${details.customerName}
        - Projektnamn: ${details.projectName}
        - Arbetsbeskrivning: ${details.workDescription}
        - Prisuppskattning: ${details.priceEstimate} SEK

        Inkludera följande sektioner i HTML-strukturen:
        1.  En tydlig rubrik "Offert från ByggPilot".
        2.  Projekt- och kundinformation.
        3.  Dagens datum.
        4.  En detaljerad beskrivning av arbetet som ska utföras.
        5.  Den uppskattade kostnaden, tydligt specificerad.
        6.  Information om nästa steg (t.ex. "Kontakta oss för att godkänna offerten").
        7.  En avslutande hälsning.

        Använd grundläggande HTML-element som <h1>, <h2>, <p>, <strong>, <hr>.
    `;
};

async function getDriveService() {
    const auth = await authenticate();
    return google.drive({ version: 'v3', auth });
}

export async function POST(req: NextRequest) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        console.error("[Generate Offer] GEMINI_API_KEY är inte konfigurerad.");
        return NextResponse.json({ error: "Serverkonfigurationsfel: AI-motorn är inte konfigurerad." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { offerDetails } = body;
        
        if (!offerDetails) {
            return NextResponse.json({ error: 'Offertdetaljer saknas' }, { status: 400 });
        }

        const prompt = createOfferPrompt(offerDetails);
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const generationResult = await model.generateContent(prompt);
        const offerContent = generationResult.response.text();

        const drive = await getDriveService();
        
        let parentFolderId = await findFolderIdByName(drive, 'ByggPilot - Projekt');
        if (!parentFolderId) {
             return NextResponse.json({ error: "Huvudmappen 'ByggPilot - Projekt' kunde inte hittas." }, { status: 500 });
        }
        
        let projectFolderId: string | null = await findFolderIdByName(drive, offerDetails.projectName);
        if (!projectFolderId) {
            console.log(`Projektmapp för '${offerDetails.projectName}' hittades inte, skapar ny...`);
            const projectFolderMetadata = {
                name: offerDetails.projectName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId]
            };
            const projectFolder = await drive.files.create({
                requestBody: projectFolderMetadata,
                fields: 'id'
            });
            projectFolderId = projectFolder.data.id ?? null;
            if (!projectFolderId) {
                throw new Error('Kunde inte skapa projektmappen i Google Drive.');
            }
        }

        const fileName = `Offert_${offerDetails.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        const fileMetadata = {
            name: fileName,
            parents: [projectFolderId], // VÄRLDSKLASS-KORRIGERING: Nu är vi säkra på att detta är en string
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

        // VÄRLDSKLASS-KORRIGERING: Korrekt hantering av response-data
        if (!createdFile.data || !createdFile.data.webViewLink) {
             throw new Error('Filen skapades, men en länk kunde inte genereras.');
        }

        return NextResponse.json({ 
            success: true, 
            message: "Offerten har skapats med AI och sparats i Google Drive.",
            fileLink: createdFile.data.webViewLink
        });

    } catch (error: any) {
        console.error("Fel vid skapande av offert:", error);
        return NextResponse.json({ error: `Serverfel: ${error.message}` }, { status: 500 });
    }
}
