import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Simulerad adminDb om du inte har en riktig
const adminDb = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => {
        console.warn("VARNING: Använder simulerad databas. Ingen refreshToken hittades.");
        return {
          exists: false,
          data: () => undefined,
        };
      },
    }),
  }),
};


export async function POST(request: Request) {
  try {
    const userId = "placeholder-user-id"; 
    const companyName = "Mitt Byggföretag";
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Användaren är inte ansluten till Google.' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const mainFolderName = `ByggPilot - ${companyName}`;

    // IDEMPOTENCY CHECK: Kontrollera om huvudmappen redan finns
    const searchResponse = await drive.files.list({
        q: `name='${mainFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        console.log(`Mappen "${mainFolderName}" finns redan.`);
        return NextResponse.json({ success: true, message: `Mappstrukturen "${mainFolderName}" finns redan.` });
    }

    // Om mappen inte finns, fortsätt att skapa den
    console.log(`Mappen "${mainFolderName}" hittades inte, skapar ny...`);

    const subFolders = [
        '01_Kunder & Anbud',
        '02_Pågående Projekt',
        '03_Avslutade Projekt',
        '04_Företagsmallar',
        '05_Bokföringsunderlag'
    ];
    const bokforingSubFolders = ['Q1_Kvitton', 'Q2_Kvitton', 'Q3_Kvitton', 'Q4_Kvitton'];

    const fileMetadata = {
      name: mainFolderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    const mainFolder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    const mainFolderId = mainFolder.data.id;

    if (!mainFolderId) {
        throw new Error('Kunde inte skapa huvudmappen.');
    }

    for (const folderName of subFolders) {
        const subFolderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId],
        };
        const createdSubFolder = await drive.files.create({ requestBody: subFolderMetadata, fields: 'id' });
        
        if (folderName === '05_Bokföringsunderlag' && createdSubFolder.data.id) {
            for (const qFolderName of bokforingSubFolders) {
                 const qFolderMetadata = {
                    name: qFolderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [createdSubFolder.data.id],
                };
                await drive.files.create({ requestBody: qFolderMetadata });
            }
        }
    }

    return NextResponse.json({ success: true, message: `Mappstrukturen "${mainFolderName}" har skapats i din Google Drive!` });

  } catch (error) {
    console.error('Fel vid skapande av mappstruktur:', error);
    const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
    return NextResponse.json({ error: 'Något gick fel på servern.', details: errorMessage }, { status: 500 });
  }
}
