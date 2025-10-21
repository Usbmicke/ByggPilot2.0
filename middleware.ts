
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// --- Konfiguration ---
const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const LANDING_PAGE_PATH = '/';
const SIGNIN_PATH = '/api/auth/signin';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1. Användare är INTE inloggad
  if (!token) {
    // Om de försöker nå en skyddad sida (allt utom landningssidan i detta fall, eftersom matchern är specifik)
    if (pathname !== LANDING_PAGE_PATH) {
        const signInUrl = new URL(SIGNIN_PATH, req.url);
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // 2. Användare ÄR inloggad
  const onboardingComplete = token.onboardingComplete === true;

  // 2a. Onboarding är INTE komplett
  if (!onboardingComplete) {
    if (pathname !== ONBOARDING_PATH) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
    }
    return NextResponse.next();
  }

  // 2b. Onboarding ÄR komplett
  if (pathname === LANDING_PAGE_PATH || pathname === ONBOARDING_PATH) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/onboarding',
    '/anvandarvillkor',
    '/integritetspolicy'
  ],
};
