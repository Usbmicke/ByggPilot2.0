
// GULDSTANDARD v15.0: Skyddande Middleware
import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/app/_lib/session';
import { cookies } from 'next/headers';

/**
 * Middleware som körs före varje request för att skydda rutter.
 * - Verifierar att användaren är inloggad för att komma åt /dashboard.
 * - Omdirigerar inloggade användare från publika sidor (som /) till /dashboard.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const { isLoggedIn } = session;

  const { pathname } = req.nextUrl;

  // Om användaren försöker nå en skyddad route (allt under /dashboard)
  if (pathname.startsWith('/dashboard')) {
    // och INTE är inloggad, omdirigera till landningssidan för inloggning.
    if (!isLoggedIn) {
      console.log(`[Middleware] Obehörig åtkomst till ${pathname}. Omdirigerar till /.`);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Om användaren ÄR inloggad och försöker nå landningssidan (/)
  if (isLoggedIn && pathname === '/') {
    // Omdirigera dem direkt till dashboarden, eftersom de redan är autentiserade.
    console.log(`[Middleware] Inloggad användare på /. Omdirigerar till /dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// Konfiguration för att specificera vilka sökvägar denna middleware ska köras på.
export const config = {
  // Matchar alla rutter FÖRUTOM de som är definierade som statiska filer eller API-anrop.
  // Detta är en säkrare standard för att undvika att blockera kritiska Next.js-assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
