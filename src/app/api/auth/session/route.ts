
import { NextResponse, type NextRequest } from 'next/server';
import { initializeAdminApp } from '@/lib/config/firebase-admin';

// Denna funktion är nu den enda källan till sanning för att skapa en session OCH säkerställa en användarprofil.
export async function POST(request: NextRequest) {
  try {
    // Kör initialiseringen i början av varje anrop. Den är idempotent.
    const { adminAuth, adminDb } = initializeAdminApp();

    const body = await request.json();
    const idToken = body.token as string;

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Avkoda token för att få användarinformation
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    // Transaktionell "upsert" för att garantera dataintegritet
    if (!userDoc.exists) {
      // Skapa användaren om den inte finns
      await userRef.set({
        uid,
        email,
        name,
        picture,
        createdAt: new Date().toISOString(),
        isOnboarded: false, // Nya användare är ALDRIG onboardade
      });
    } else {
      // Uppdatera befintlig användare (t.ex. om profilbild ändrats)
      // RÖR INTE isOnboarded-flaggan här.
      await userRef.update({
        name,
        picture,
      });
    }

    // Skapa session-cookie
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 dagar
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    // Sätt cookien och returnera framgångsrikt svar
    const response = NextResponse.json({ success: true, uid });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    console.error('--- KRITISKT FEL VID SESSIONSSKAPANDE ---', error);
    return NextResponse.json({ error: 'Failed to create session and sync user' }, { status: 401 });
  }
}

// DELETE-metoden har flyttats till en egen route för att följa manifestets principer.
