import { NextResponse, type NextRequest } from 'next/server';

// 1. Konfigurera vilka sökvägar denna middleware ska agera på.
export const config = {
  matcher: [
    /*
     * Matcha alla sökvägar FÖRUTOM:
     * - /api (API-rutter)
     * - /_next/static (statiska filer)
     * - /_next/image (bildoptimeringsfiler)
     * - /favicon.ico (favicon-fil)
     * - /images (statiska bilder i public-mappen)
     * - / (själva landningssidan, som hanteras separat)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|).+)',
    '/', // Inkludera roten för att hantera fallet där en inloggad användare besöker den.
  ],
};

// 2. Definiera de olika typerna av sidor
const PUBLIC_PATHS = ['/integritetspolicy', '/login']; // Sidor som är helt offentliga
const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const ROOT_PATH = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const absoluteURL = new URL('/', request.nextUrl.origin);

  // Anropa vår säkra backend-funktion för att verifiera sessionen och hämta onboarding-status
  // Vi skickar med cookies från den ursprungliga requesten
  const response = await fetch(new URL('/api/auth/verify', absoluteURL), {
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  });
  const { isAuthenticated, isOnboarded } = await response.json();

  // --- LOGIK-TRÄD FÖR OMDIRIGERING ---

  // A. Användaren är inloggad
  if (isAuthenticated) {
    // A1. Men har INTE slutfört onboarding
    if (!isOnboarded) {
      // Om de INTE är på onboarding-sidan, tvinga dem dit.
      if (pathname !== ONBOARDING_PATH) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }
    } 
    // A2. Och HAR slutfört onboarding
    else {
      // Om de är på onboarding-sidan eller landningssidan, skicka dem till dashboard.
      if (pathname === ONBOARDING_PATH || pathname === ROOT_PATH) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
    }
  } 
  // B. Användaren är INTE inloggad
  else {
    // Om de försöker nå en skyddad sida (allt som inte är explicit publikt), skicka dem till roten.
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!isPublic && pathname !== ROOT_PATH) {
      return NextResponse.redirect(new URL(ROOT_PATH, request.url));
    }
  }

  // C. Om ingen av ovanstående regler matchar, låt förfrågan passera.
  return NextResponse.next();
}
