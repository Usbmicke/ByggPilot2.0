
// GULDSTANDARD v15.0: Säker Inloggnings-API-Route
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/app/_lib/config/firebase-admin';
import { dal } from '@/app/_lib/dal/dal';
import { getVerifiedSession, SessionData } from '@/app/_lib/session';

/**
 * ENDPOINT: /api/auth/login
 * METOD: POST
 * 
 * Hanterar användarinloggning. Tar emot en Firebase ID-token från klienten,
 * verifierar den mot Firebase Admin SDK, och skapar en krypterad, httpOnly
 * server-session-cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // 1. Verifiera ID-token med Firebase Admin SDK.
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2. Hämta eller skapa användarprofil i vår databas via DAL.
    const userProfile = await dal.findOrCreateUser({
      uid,
      email,
      displayName: name,
      photoURL: picture,
    });

    // 3. Skapa och kryptera sessionen.
    const session = await getVerifiedSession();
    session.user = userProfile;
    session.isLoggedIn = true;
    await session.save(); // Sparar sessionen och sätter den krypterade cookien i svaret.

    console.log(`[API /auth/login] Användare ${userProfile.uid} loggade in. Session skapad.`);

    // 4. Returnera ett framgångsrikt svar.
    // Klienten ansvarar nu för att omdirigera användaren.
    return NextResponse.json({ success: true, user: userProfile });

  } catch (error) {
    console.error('[API /auth/login] Inloggningsfel:', error);
    // Rensa en eventuell felaktig session
    const session = await getVerifiedSession();
    session.destroy();
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
