
// src/app/api/auth/verify/route.ts
import { NextResponse, type NextRequest } from 'next/server';
// KORREKT IMPORT: Importera de färdiga, initialiserade tjänsterna direkt.
import { adminAuth, adminDb } from '@/lib/config/firebase-admin'; 

export const runtime = 'nodejs'; // Tvinga Node.js!

export async function GET(request: NextRequest) {
  console.log('[API /verify]: Startar GET-förfrågan.');
  try {
    // INGEN initializeAdminApp() behövs längre. Tjänsterna är redan redo.
    const sessionCookie = request.cookies.get('session')?.value || '';
    if (!sessionCookie) {
      console.log('[API /verify]: Ingen session-cookie funnen. Användaren är inte inloggad på servern.');
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Använd `adminAuth` direkt.
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log(`[API /verify]: Session-cookie verifierad för UID: ${decodedToken.uid}`);

    // Använd `adminDb` direkt.
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      console.warn(`[API /verify]: Användare ${decodedToken.uid} har en giltig cookie men saknar profil i databasen. Betraktas som ej onboardad.`);
      // Användaren är autentiserad men inte onboardad.
      return NextResponse.json({ isAuthenticated: true, uid: decodedToken.uid, isOnboarded: false }, { status: 200 });
    }

    const isOnboarded = userDoc.data()?.isOnboarded === true;
    console.log(`[API /verify]: Verifiering lyckades. UID: ${decodedToken.uid}, Onboarded: ${isOnboarded}`);
    return NextResponse.json({ isAuthenticated: true, uid: decodedToken.uid, isOnboarded }, { status: 200 });

  } catch (error: any) {
    // Fångar fel som ogiltig eller utgången cookie.
    console.log(`[API /verify]: Verifiering misslyckades. Troligtvis ogiltig cookie. Fel: ${error.code}`);
    return NextResponse.json({ isAuthenticated: false, error: error.message }, { status: 401 });
  }
}
