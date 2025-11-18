
import { NextResponse, type NextRequest } from 'next/server';
// KORRIGERAD SÖKVÄG: Importerar från den nya, centraliserade konfigurationsfilen.
import { auth } from '@/app/_lib/config/firebase-admin';

// Giltighetstid för session-cookien i millisekunder.
// 5 dagar = 5 * 24 * 60 * 60 * 1000 = 432 000 000 ms
const SESSION_COOKIE_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

/**
 * Denna endpoint är den enda bron mellan klientens Firebase-autentisering och vår server-session.
 * Den tar emot ett ID-token från en autentiserad klient och byter det mot en säker, 
 * HTTP-only session-cookie som kan användas av middleware och server-komponenter.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Hämta ID-token från request body
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'ID-token saknas.' }), { status: 400 });
    }

    // 2. Skapa session-cookie med Firebase Admin SDK
    // `auth.createSessionCookie` verifierar ID-tokenet och skapar en JWT-cookie.
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN_MS });

    // 3. Sätt cookien i svaret
    const response = new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    // Sätt cookie-alternativen för säkerhet
    response.cookies.set('session', sessionCookie, {
      httpOnly: true, // Kan inte läsas av klient-skript
      secure: process.env.NODE_ENV === 'production', // Skicka bara över HTTPS i produktion
      maxAge: SESSION_COOKIE_EXPIRES_IN_MS, // Samma giltighetstid som JWT-tokenet
      path: '/', // Tillgänglig för hela appen
      sameSite: 'lax', // Bra skydd mot CSRF
    });

    return response;

  } catch (error) {
    console.error('Fel vid skapande av session-cookie:', error);
    return new NextResponse(JSON.stringify({ error: 'Kunde inte skapa session.' }), { status: 401 });
  }
}
