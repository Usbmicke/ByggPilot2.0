
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware fungerar som en centraliserad väktare för applikationen.
 * Den körs före renderingen av en sida och kan omdirigera baserat på sessionens tillstånd.
 * Detta är den perfekta platsen att implementera ett vattentätt, obligatoriskt onboarding-flöde.
 */
export async function middleware(req: NextRequest) {
  // Hämta JWT-token från requesten. `getToken` hanterar dekryptering automatiskt.
  // Vi använder JWT för att kunna läsa vår anpassade `onboardingComplete`-flagga.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // UNDANTAG: Tillåt alltid anrop till API-routes, statiska filer, och själva onboarding-sidan.
  // Detta förhindrar oändliga omdirigeringsloopar.
  const isPublicPath = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next/static') || 
    pathname.startsWith('/_next/image') || 
    pathname === '/favicon.ico' ||
    pathname === '/' || // Tillåt landningssidan
    pathname === '/integritetspolicy';

  // Om användaren är inloggad (token finns) och har INTE slutfört onboarding
  if (token && token.onboardingComplete === false) {
    // Om de försöker nå någon annan sida än onboarding-sidan...
    if (pathname !== '/onboarding') {
      // ...tvinga en omdirigering till onboarding-sidan.
      const url = req.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }
  
  // Om användaren är inloggad och HAR slutfört onboarding
  if (token && token.onboardingComplete === true) {
      // Om de av någon anledning försöker gå till inloggningssidan eller onboarding igen...
      if (pathname === '/' || pathname === '/onboarding') {
          // ...skicka dem direkt till dashboarden.
          const url = req.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
      }
  }

  // Om ingen av ovanstående regler matchar, fortsätt som vanligt.
  return NextResponse.next();
}

// Konfigurera vilka sökvägar som denna middleware ska appliceras på.
// Vi vill att den ska köras på alla sidor för att garantera fullständig säkerhet.
export const config = {
  matcher: [
    /*
     * Matcha alla request-sökvägar förutom de som börjar med:
     * - api (API-routes)
     * - _next/static (statiska filer)
     * - _next/image (bildoptimeringsfiler)
     * - favicon.ico (favicon-fil)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).+)',
  ],
};
