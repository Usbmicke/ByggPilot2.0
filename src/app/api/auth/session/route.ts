
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/app/_lib/config/firebase-admin';
import { getOrCreateUserFromToken } from '@/app/_lib/dal/dal'; // Importera den nya funktionen

const SESSION_COOKIE_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 dagar

export async function POST(request: NextRequest) {
  console.log("[API /api/auth/session] Mottog begäran.");
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ status: 'error', message: 'ID-token saknas.' }, { status: 400 });
  }

  try {
    // Steg 1: Dekoda token för att få användarinformation
    const decodedToken = await auth.verifyIdToken(idToken);

    // Steg 2: Använd den nya DAL-funktionen för att säkerställa att en profil existerar
    // Detta löser race condition-problemet vid nyregistrering.
    await getOrCreateUserFromToken(decodedToken);
    console.log(`[API /api/auth/session] Användarprofil för ${decodedToken.uid} är säkerställd.`);

    // Steg 3: Skapa session-cookien, nu när vi VET att en profil finns
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN_MS });
    console.log("[API /api/auth/session] Session-cookie skapad.");

    const response = NextResponse.json({ status: 'success' }, { status: 200 });

    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: SESSION_COOKIE_EXPIRES_IN_MS,
      path: '/',
      sameSite: 'none', 
    });
    
    console.log("[API /api/auth/session] Cookie inställd. Skickar svar.");
    return response;

  } catch (error: any) {
    console.error(`[API /api/auth/session] KRITISKT FEL: ${error.message}`, error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Server-fel vid skapande av session.',
        error: { name: error.name, code: error.code, message: error.message }
      },
      { status: 500 }
    );
  }
}
