
// Fil: app/api/events/list/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from "next-auth/next"

// Importerar den konfigurerade NextAuth-handlern
import { handler } from "@/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  // 1. Säkerställ att användaren är inloggad
  const session = await getServerSession(handler);
  if (!session || !session.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Initiera Google Kalender-API:et
    const calendar = google.calendar('v3');
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    // 3. Hämta kalenderhändelser
    const response = await calendar.events.list({
      auth: auth,
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    if (!events || events.length === 0) {
        return NextResponse.json([]); // Returnera en tom lista om inga händelser finns
    }

    // 4. Formatera och returnera händelserna
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      htmlLink: event.htmlLink,
    }));

    return NextResponse.json(formattedEvents);

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
