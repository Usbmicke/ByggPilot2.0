
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
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // --- NY, ROBUST LOGIK ---

  // 1. Användare är INTE inloggad
  if (!token) {
    // Om de försöker nå en skyddad sida (som inte är publik och inte landningssidan),
    // skicka dem till inloggningssidan.
    if (!isPublicPath && pathname !== LANDING_PAGE_PATH) {
        const signInUrl = new URL(SIGNIN_PATH, req.url);
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
    // Låt dem annars vara (på landningssida eller publik sida)
    return NextResponse.next();
  }

  // 2. Användare ÄR inloggad
  const onboardingComplete = token.onboardingComplete === true;

  // 2a. Onboarding är INTE komplett
  if (!onboardingComplete) {
    // Om de INTE redan är på onboarding-sidan, tvinga dem dit.
    if (pathname !== ONBOARDING_PATH) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
    }
    // Om de redan är där, låt dem vara.
    return NextResponse.next();
  }

  // 2b. Onboarding ÄR komplett
  // Om en färdig användare är på landningssidan, onboarding-sidan
  // eller en inloggnings-relaterad sida, skicka dem till sin dashboard.
  if (pathname === LANDING_PAGE_PATH || pathname === ONBOARDING_PATH) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
  }

  // 3. Om ingen av de tvingande reglerna ovan matchar, låt förfrågan passera.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|.*\..*).*)'],
};
