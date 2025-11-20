
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/app/_lib/config/firebase-admin';

const SESSION_COOKIE_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 dagar

// =======================================================================
//  API ENDPOINT: Skapa Session-cookie (/api/auth/session)
//  (VERSION 3.0 - Förenklad)
// =======================================================================
// Denna endpoint tar endast emot en ID-token från klienten, verifierar den,
// och skapar en säker, httpOnly session-cookie. Användarprofilen i Firestore
// skapas nu automatiskt via en Cloud Function (se functions/index.js).

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'ID-token saknas.' }), { status: 400 });
    }

    // 1. Skapa en session-cookie från ID-token.
    // Firebase Admin SDK verifierar automatiskt idToken i detta steg.
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN_MS });

    // 2. Bygg svaret och sätt den säkra cookien.
    const response = new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true, // Alltid true för HTTPS (standard i Cloud Workstations).
      maxAge: SESSION_COOKIE_EXPIRES_IN_MS,
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error('Fel vid skapande av session-cookie:', error);
    // Detta fel inträffar oftast om idToken är ogiltig eller har gått ut.
    return new NextResponse(JSON.stringify({ error: 'Kunde inte verifiera token eller skapa session.' }), { status: 401 });
  }
}
