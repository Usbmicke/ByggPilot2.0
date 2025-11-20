
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Sökvägarna justerade för att fungera från `src`-mappen
import { getUserProfileForMiddleware } from './app/_lib/dal/dal'; 
import { auth } from './app/_lib/config/firebase-admin'; 

export const runtime = 'nodejs';

/**
 * Middleware för att skydda rutter och hantera omdirigeringar.
 * Körs på servern före varje request till matchande rutter.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value || '';

  // Om det inte finns någon session-cookie och användaren INTE är på startsidan,
  // skicka dem dit. Annars låt dem vara.
  if (!sessionCookie && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Om det finns en cookie, försök verifiera den
  if (sessionCookie) {
      try {
        // Verifiera session-cookien med Firebase Admin SDK
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
        const userId = decodedToken.uid;

        // Använd den nya DAL-funktionen speciellt för middleware
        const userProfile = await getUserProfileForMiddleware(userId);
        const isOnboardingComplete = userProfile?.onboardingStatus === 'complete';

        // REGEL 1: Inloggad användare på startsidan -> skicka till rätt plats
        if (pathname === '/') {
            if (isOnboardingComplete) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } else {
                return NextResponse.redirect(new URL('/onboarding', request.url));
            }
        }

        // REGEL 2: Användare försöker nå /onboarding men är redan klar -> skicka till dashboard
        if (pathname.startsWith('/onboarding') && isOnboardingComplete) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // REGEL 3: Användare försöker nå /dashboard men har INTE klarat onboarding -> skicka till onboarding
        if (pathname.startsWith('/dashboard') && !isOnboardingComplete) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }

      } catch (error) {
        // Om verifieringen misslyckas (t.ex. ogiltig/utgången cookie), rensa den och skicka till login
        console.error('Middleware Auth Error:', error);
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('__session');
        return response;
      }
  }

  // Om ingen av reglerna ovan matchade, låt användaren fortsätta till den begärda sidan.
  return NextResponse.next();
}

export const config = {
  // Matchar alla relevanta sidor för att säkerställa att omdirigering alltid sker korrekt.
  matcher: [
    '/',
    '/dashboard/:path*',
    '/onboarding',
  ],
};
