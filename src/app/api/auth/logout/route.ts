
// GULDSTANDARD v15.0: Säker Utloggnings-API-Route
import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/app/_lib/session';

/**
 * ENDPOINT: /api/auth/logout
 * METOD: POST
 * 
 * Hanterar användarutloggning genom att förstöra den krypterade server-sessionen.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getVerifiedSession();
    const userId = session.user?.uid;

    // Förstör sessionen och tar bort cookien från webbläsaren.
    session.destroy();

    console.log(`[API /auth/logout] Användare ${userId || 'N/A'} loggade ut. Session förstörd.`);

    // Skickar ett svar som indikerar att klienten kan rensa sitt state och omdirigera.
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API /auth/logout] Utloggningsfel:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
