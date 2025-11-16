import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|).+)',
    '/',
  ],
};

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const ROOT_PATH = '/';
const PUBLIC_PATHS = ['/integritetspolicy', '/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const absoluteURL = new URL('/', request.nextUrl.origin);

  // Anropa vår säkra backend-funktion för att verifiera sessionen
  const verifyResponse = await fetch(new URL('/api/auth/verify', absoluteURL), {
    headers: { cookie: request.headers.get('cookie') || '' },
  });

  const { isAuthenticated, isOnboarded } = await verifyResponse.json();

  // --- LOGIK-TRÄD FÖR OMDIRIGERING ---

  if (isAuthenticated) {
    // Användaren är inloggad
    if (!isOnboarded) {
      // ...men har INTE slutfört onboarding.
      // Om de INTE redan är på onboarding-sidan, skicka dem dit.
      if (pathname !== ONBOARDING_PATH) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }
    } else {
      // ...och HAR slutfört onboarding.
      // Om de är på onboarding-sidan eller landningssidan, skicka dem till dashboard.
      if (pathname === ONBOARDING_PATH || pathname === ROOT_PATH) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
    }
  } else {
    // Användaren är INTE inloggad.
    // Om de försöker nå en skyddad sida, skicka dem till roten.
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!isPublic && pathname !== ROOT_PATH) {
      return NextResponse.redirect(new URL(ROOT_PATH, request.url));
    }
  }

  // Om ingen av ovanstående regler matchar, låt förfrågan passera.
  // Detta är kritiskt för att tillåta visning av t.ex. /onboarding för en ny användare.
  return NextResponse.next();
}
