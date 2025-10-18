import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// --- Konfiguration ---
const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const LANDING_PAGE_PATH = '/';
const SIGNIN_PATH = '/api/auth/signin';

// Lista över publika sökvägar som inte kräver autentisering
const PUBLIC_PATHS = ['/anvandarvillkor', '/integritetspolicy'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorera interna Next.js-anrop och fil-assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') || // API-routes hanterar sin egen auth
    pathname.includes('.') // T.ex. favicon.ico, .png
  ) {
    return NextResponse.next();
  }

  // Hämta sessionstoken PÅ ETT SÄKERT sätt
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // --- Logik ---

  // 1. Användare är inloggad (har en token)
  if (token) {
    const onboardingComplete = token.onboardingComplete === true;

    // 1a. Onboarding är INTE komplett
    if (!onboardingComplete) {
      // Om de inte redan är på onboarding-sidan, skicka dit dem.
      if (pathname !== ONBOARDING_PATH) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
      }
    }
    
    // 1b. Onboarding ÄR komplett
    else {
      // Om de är på onboarding- eller landningssidan, skicka dem till sin dashboard.
      if (pathname === ONBOARDING_PATH || pathname === LANDING_PAGE_PATH) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
      }
    }
  }

  // 2. Användare är INTE inloggad (har ingen token)
  else {
    // Om de försöker nå en skyddad sida (som inte är publik och inte landningssidan),
    // skicka dem till inloggningssidan.
    if (!isPublicPath && pathname !== LANDING_PAGE_PATH) {
        // Skapa en ren sign-in URL utan dubbla callbacks.
        const signInUrl = new URL(SIGNIN_PATH, req.url);
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
  }

  // 3. Om ingen av reglerna ovan matchar, låt förfrågan passera.
  return NextResponse.next();
}

export const config = {
  // Matcha alla sökvägar FÖRUTOM de som har en punkt (filer) eller börjar med /api eller /_next
  matcher: ['/((?!api|_next/static|.*\..*).*)'],
};