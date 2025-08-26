// Kod för: /app/api/drive/route.ts

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { accessToken, projectName } = await request.json();

    if (!accessToken || !projectName) {
      return NextResponse.json({ status: 'error', message: 'Nödvändig information saknas (accessToken eller projectName).' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Steg 1: Skapa huvudmappen "ByggPilot - [Företagsnamn]" om den inte finns
    // (Förenklad för detta exempel, vi antar att den finns)

    // Steg 2: Skapa den nya projektmappen
    const projectFolder = await drive.files.create({
      requestBody: {
        name: projectName,
        mimeType: 'application/vnd.google-apps.folder',
        // Här skulle vi specificera att den ska ligga i "02_Pågående Projekt"-mappen
      },
      fields: 'id',
    });

    const projectFolderId = projectFolder.data.id;
    if (!projectFolderId) {
      throw new Error('Kunde inte skapa projektmappen.');
    }

    // Steg 3: Skapa undermapparna
    const subFolders = ['1_Ritningar & Kontrakt', '2_Bilder & Dokumentation', '3_Ekonomi', '4_ÄTA'];
    for (const folderName of subFolders) {
      await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [projectFolderId],
        },
      });
    }

    const responseData = {
      status: 'success',
      message: `Klart! Jag har skapat en ny projektmapp för "${projectName}" i din Google Drive.`,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Fel i Google Drive API-funktionen:", error);
    const errorResponse = {
      status: 'error',
      message: 'Kunde inte skapa mappstrukturen i Google Drive.',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
