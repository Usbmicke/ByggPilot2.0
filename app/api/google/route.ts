import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Kontrollera om Firebase Admin redan är initialiserat
if (!admin.apps.length) {
  try {
    // Hitta sökvägen till servicekontonyckeln
    const keyFilePath = path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS as string);
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialiserat.");
  } catch (error) {
    console.error("Kunde inte initialisera Firebase Admin SDK:", error);
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ status: 'error', message: 'Access token saknas.' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const mailResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
    });

    const latestMessageId = mailResponse.data.messages?.[0]?.id;
    let mailSubject = "Inget mail hittades";

    if (latestMessageId) {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: latestMessageId,
      });
      mailSubject = message.data.snippet || "Okänt ämne";
    }

    const event = {
      summary: 'Automatiskt skapad händelse från ByggPilot',
      description: `Denna händelse skapades baserat på ditt senaste mail med ämnet/innehållet: \"${mailSubject}\"`,
      start: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Stockholm',
      },
      end: {
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Stockholm',
      },
    };

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    const responseData = {
      status: 'success',
      message: `Svar från servern: Läste ditt senaste mail (\"${mailSubject}\") och skapade en händelse i din kalender!`,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Fel i Google API-funktionen:", error);
    
    const errorResponse = {
      status: 'error',
      message: 'Kunde inte kommunicera med Google APIs. Se till att du har gett rätt behörigheter och försök igen.',
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}