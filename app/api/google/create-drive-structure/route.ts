import { NextResponse } from 'next/server';
import { google } from 'googleapis';
// OBS: Du behöver en firebaseAdmin-fil för att ansluta till Firestore.
// Om du inte har en, behöver den skapas.
// import { adminDb } from '@/lib/firebaseAdmin'; // Antagande om filens plats

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
    // STEG 1: Hämta användarens ID och refreshToken
    // I en riktig app hämtar du användarens ID från en säker session/token.
    // Här använder vi en platshållare.
    const userId = "placeholder-user-id"; // Byt ut mot riktig sessionshantering
    const companyName = "Mitt Byggföretag"; // Detta bör också hämtas från användarens profil

    // Hämta användarens refreshToken från Firestore
    // const tokenDoc = await adminDb.collection('users').doc(userId).get();
    // const refreshToken = tokenDoc.data()?.googleRefreshToken;
    
    // ANVÄND EN PLATSHÅLLARE FÖR TESTNING TILLS FIRESTORE ÄR HELT KONFIGURERAT
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;


    if (!refreshToken) {
      return NextResponse.json({ error: 'Användaren är inte ansluten till Google.' }, { status: 401 });
    }

    // STEG 2: Konfigurera Google API-klient
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // STEG 3: Definiera mappstrukturen
    const mainFolderName = `ByggPilot - ${companyName}`;
    const subFolders = [
        '01_Kunder & Anbud',
        '02_Pågående Projekt',
        '03_Avslutade Projekt',
        '04_Företagsmallar',
        '05_Bokföringsunderlag'
    ];
    const bokforingSubFolders = ['Q1_Kvitton', 'Q2_Kvitton', 'Q3_Kvitton', 'Q4_Kvitton'];

    // STEG 4: Skapa mapparna
    // Skapa huvudmappen
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

    // Skapa undermappar
    for (const folderName of subFolders) {
        const subFolderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId],
        };
        const createdSubFolder = await drive.files.create({ requestBody: subFolderMetadata, fields: 'id' });
        
        // Skapa kvartalsmappar under "Bokföringsunderlag"
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
    return NextResponse.json({ error: 'Något gick fel på servern.' }, { status: 500 });
  }
}
