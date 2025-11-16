
import { NextResponse, type NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/lib/config/firebase-admin';

// Denna funktion hanterar skapandet av en säker session-cookie.
export async function POST(request: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const body = await request.json();
    const idToken = body.idToken as string;

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Sessionen är giltig i 14 dagar, vilket är standard för många webbappar.
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 dagar i millisekunder

    // Skapa session-cookien med det verifierade ID-tokenet.
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Sätt cookien i svarets header. 
    // httpOnly: Cookien kan inte nås via klient-script, skyddar mot XSS.
    // secure: Skickas endast över HTTPS.
    // path: Tillgänglig för hela applikationen.
    // sameSite: 'Lax' är en bra balans mellan säkerhet och användarvänlighet.
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax' as const,
    };

    const response = NextResponse.json({ success: true });
    response.cookies.set(options);

    return response;

  } catch (error: any) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// Denna funktion hanterar utloggning genom att rensa session-cookien.
export async function DELETE(request: NextRequest) {
  try {
    // Instruera webbläsaren att radera cookien genom att sätta en utgången maxAge.
    const options = {
      name: 'session', 
      value: '', 
      maxAge: -1, 
    };

    const response = NextResponse.json({ success: true });
    response.cookies.set(options);

    return response;

  } catch (error: any) {
    console.error('Session Logout Error:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}

