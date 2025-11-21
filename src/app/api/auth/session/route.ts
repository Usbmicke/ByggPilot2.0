
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/app/_lib/config/firebase-admin';

const SESSION_COOKIE_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 dagar

export async function POST(request: NextRequest) {
  console.log("[API /api/auth/session] Mottog begäran.");
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json(
      { status: 'error', message: 'ID-token saknas i request body.' },
      { status: 400 }
    );
  }

  try {
    console.log("[API /api/auth/session] Försöker skapa session-cookie...");
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN_MS });
    console.log("[API /api/auth/session] Session-cookie skapad. Förbereder svar.");

    const response = NextResponse.json(
      { status: 'success', message: 'Cookie skapad och kommer att ställas in.' },
      { status: 200 }
    );

    // ================== VIKTIG ÄNDRING FÖR CROSS-ORIGIN ==================
    // Ändrar sameSite till 'none' för att tillåta cookies att ställas in
    // i en proxied/cross-origin utvecklingsmiljö. Kräver secure: true.
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true, 
      maxAge: SESSION_COOKIE_EXPIRES_IN_MS,
      path: '/',
      sameSite: 'none', // Tidigare 'lax'
    });
    // =====================================================================
    
    console.log("[API /api/auth/session] Cookie inställd i svar. Skickar...");
    return response;

  } catch (error: any) {
    console.error(`[API /api/auth/session] KRITISKT FEL: ${error.message}`, error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Server-fel vid skapande av session-cookie.',
        error: {
          name: error.name,
          code: error.code,
          message: error.message,
        }
      },
      { status: 500 }
    );
  }
}
