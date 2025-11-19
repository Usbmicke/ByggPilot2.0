
import { NextResponse, type NextRequest } from 'next/server';
import { auth, firestore } from '@/app/_lib/config/firebase-admin';

const SESSION_COOKIE_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 dagar

// =======================================================================
//  API ENDPOINT: Skapa Session & Synka Användare (/api/auth/session)
//  (VERSION 2.0 - STABIL OCH KOMPLETT)
// =======================================================================

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'ID-token saknas.' }), { status: 400 });
    }

    // 1. Verifiera ID-token för att få användarinformation
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // 2. Kontrollera om användaren redan finns i Firestore
    const userRef = firestore.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // 3. Om användaren INTE finns, skapa en ny profil
      // Detta är den avgörande steget för en ny användare (onboarding)
      await userRef.set({
        uid: uid,
        email: email || '', // Säkerställ att fälten alltid finns
        displayName: name || '',
        onboardingStatus: 'incomplete', // Sätt initial status
        createdAt: new Date().toISOString(),
      });
    }
    
    // 4. Skapa session-cookie
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_EXPIRES_IN_MS });

    // 5. Sätt den säkra cookien i svaret
    const response = new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_COOKIE_EXPIRES_IN_MS,
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error('Fel vid skapande av session eller användare:', error);
    return new NextResponse(JSON.stringify({ error: 'Kunde inte verifiera token eller skapa session.' }), { status: 401 });
  }
}
