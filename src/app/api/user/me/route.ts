
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // <-- Importera cookies här!
import { verifySession, getMyProfile } from '@/app/_lib/dal/dal';

export async function GET(request: NextRequest) {
  try {
    // Steg 1: Ansvaret att läsa cookien ligger nu HÄR.
    const sessionCookie = cookies().get('__session')?.value;

    // Steg 2: Skicka cookie-värdet till den rena verifieringsfunktionen.
    const session = await verifySession(sessionCookie);

    // Steg 3: Skicka den verifierade sessionen till data-funktionen.
    const userProfile = await getMyProfile(session);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error: any) {
    // Fångar alla fel (från verifySession eller getMyProfile)
    console.error('[API /api/user/me] Authentication error:', error.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
