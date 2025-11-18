
// src/app/api/auth/session/route.ts
import { NextResponse, type NextRequest } from 'next/server';
// KORREKT IMPORT: Importera de färdiga, initialiserade tjänsterna direkt.
import { adminAuth } from '@/app/_lib/config/firebase-admin';

export const runtime = 'nodejs';

// Denna funktion skapar en session-cookie efter att klienten har loggat in.
export async function POST(request: NextRequest) {
  console.log('[API /session]: Startar POST-förfrågan för att skapa cookie.');
  try {
    const body = await request.json();
    const idToken = body.idToken as string;

    if (!idToken) {
      console.log('[API /session]: Inget ID-token i request body. Kan inte skapa cookie.');
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dagar i millisekunder

    // Använd `adminAuth` direkt. Ingen initialisering behövs.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('[API /session]: Session-cookie skapad.');

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(options);
    console.log('[API /session]: Cookie har satts i svaret. Flödet lyckades.');
    
    return response;

  } catch (error: any) {
    console.error(`[API /session]: KRITISKT FEL vid skapande av cookie: ${error.message}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
