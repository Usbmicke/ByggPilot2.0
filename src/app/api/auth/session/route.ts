import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

// Denna API-väg skapar en säker, httpOnly session-cookie efter att en användare har loggat in på klienten.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token; // Förvänta oss en Firebase ID-token

    if (!token) {
      // Om ingen token finns, tolkar vi det som en utloggning.
      const response = NextResponse.json({ success: true, message: 'Session avslutad.' });
      // Instruera webbläsaren att rensa cookien.
      response.cookies.set('session', '', { httpOnly: true, secure: true, maxAge: -1, path: '/' });
      return response;
    }

    // Verifiera ID-token med Admin SDK. Detta garanterar att den är giltig.
    await adminAuth.verifyIdToken(token);

    // Skapa en session-cookie som är giltig i 14 dagar.
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 dagar i millisekunder
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    // Sätt cookien i svaret till klienten.
    const response = NextResponse.json({ success: true, message: 'Session skapad.' });
    response.cookies.set('session', sessionCookie, { httpOnly: true, secure: true, maxAge: expiresIn, path: '/' });

    return response;

  } catch (error) {
    console.error('[Session API Error]', error);
    return NextResponse.json({ success: false, error: 'Kunde inte skapa session.' }, { status: 401 });
  }
}
