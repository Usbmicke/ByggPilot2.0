
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/app/_lib/config/firebase-admin';
import { getUserProfile } from '@/app/_lib/dal/dal';

// =======================================================================
//  API ENDPOINT: Hämta aktuell användare (/api/user/me)
// =======================================================================
// Denna skyddade endpoint hämtar och returnerar den inloggade användarens
// fullständiga profil från Firestore. Den används av klienten (t.ex. i en
// AuthContext) för att fylla på med användardata efter den initiala laddningen.

export async function GET(request: NextRequest) {
  try {
    // 1. Hämta session-cookien från requesten.
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return new NextResponse(JSON.stringify({ error: 'Ej autentiserad. Session-cookie saknas.' }), {
        status: 401, // Unauthorized
      });
    }

    // 2. Verifiera cookien med Firebase Admin SDK för att få användarens ID.
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    const userId = decodedToken.uid;

    // 3. Använd den säkra DAL-funktionen för att hämta användarprofilen från Firestore.
    const userProfile = await getUserProfile(userId);

    // Om profilen inte hittades (vilket är osannolikt om en session finns),
    // returnera ett fel.
    if (!userProfile) {
      return new NextResponse(JSON.stringify({ error: 'Användarprofilen kunde inte hittas.' }), {
        status: 404, // Not Found
      });
    }

    // 4. Returnera den fullständiga, säkra användarprofilen som JSON.
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Fel i /api/user/me:', error);
    // Om cookien är ogiltig eller utgången, kommer verifySessionCookie att kasta ett fel.
    return new NextResponse(JSON.stringify({ error: 'Ogiltig eller utgången session.' }), {
      status: 401, // Unauthorized
    });
  }
}
