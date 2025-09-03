import { NextResponse } from 'next/server';
import { google, gmail_v1 } from 'googleapis';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  try {
    const keyFilePath = path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS as string);
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("Firebase Admin SDK initialiserat.");
  } catch (error) {
    console.error("Kunde inte initialisera Firebase Admin SDK:", error);
  }
}

const PROCESSED_LABEL_NAME = 'ByggPilot-Bearbetad';

/**
 * Säkerställer att en specifik etikett finns i användarens Gmail.
 * Om den inte finns, skapas den.
 * @param gmail - En instans av Gmail API-klienten.
 * @returns {Promise<string>} ID för etiketten.
 */
async function ensureLabelExists(gmail: gmail_v1.Gmail): Promise<string> {
  const res = await gmail.users.labels.list({ userId: 'me' });
  const labels = res.data.labels || [];
  const existingLabel = labels.find(label => label.name === PROCESSED_LABEL_NAME);

  if (existingLabel && existingLabel.id) {
    console.log(`Etiketten "${PROCESSED_LABEL_NAME}" finns redan med ID: ${existingLabel.id}`);
    return existingLabel.id;
  }

  console.log(`Etiketten "${PROCESSED_LABEL_NAME}" hittades inte, skapar ny...`);
  const newLabel = await gmail.users.labels.create({
    userId: 'me',
    requestBody: {
      name: PROCESSED_LABEL_NAME,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'messageShow',
    },
  });

  if (!newLabel.data.id) {
    throw new Error('Kunde inte skapa ny etikett.');
  }
  console.log(`Etiketten "${PROCESSED_LABEL_NAME}" skapades med ID: ${newLabel.data.id}`);
  return newLabel.data.id;
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

    // Steg 1: Säkerställ att etiketten för bearbetade mail finns
    const processedLabelId = await ensureLabelExists(gmail);

    // Steg 2: Hämta det senaste obearbetade mailet
    const mailResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      q: `in:inbox -label:${PROCESSED_LABEL_NAME}` // Hämta ej bearbetade mail
    });

    const latestMessage = mailResponse.data.messages?.[0];

    if (!latestMessage || !latestMessage.id) {
      console.log("Inget nytt obearbetat mail att processa.");
      return NextResponse.json({
        status: 'success',
        message: 'Inget nytt mail att bearbeta.',
      });
    }

    const message = await gmail.users.messages.get({
      userId: 'me',
      id: latestMessage.id,
    });
    const mailSubject = message.data.snippet || "Okänt ämne";

    // Steg 3: Skapa kalenderhändelsen
    const event = {
      summary: 'Automatiskt skapad händelse från ByggPilot',
      description: `Denna händelse skapades baserat på ditt senaste mail med ämnet/innehållet: "${mailSubject}"`,
      start: { dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), timeZone: 'Europe/Stockholm' },
      end: { dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), timeZone: 'Europe/Stockholm' },
    };

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    // Steg 4: Märk mailet som bearbetat
    await gmail.users.messages.modify({
        userId: 'me',
        id: latestMessage.id,
        requestBody: {
            addLabelIds: [processedLabelId]
        }
    });
    
    console.log(`Mail med ID ${latestMessage.id} har markerats som bearbetat.`);

    return NextResponse.json({
      status: 'success',
      message: `Läste ditt senaste mail ("${mailSubject}") och skapade en händelse i din kalender!`,
    });

  } catch (error) {
    console.error("Fel i Google API-funktionen:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Kunde inte kommunicera med Google APIs. Se till att du har gett rätt behörigheter och försök igen.',
    }, { status: 500 });
  }
}

// GET-metod för att testa anslutning
export async function GET() {
  return NextResponse.json({ message: "API-endpointen är live." });
}
