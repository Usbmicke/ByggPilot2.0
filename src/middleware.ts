
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserProfileForMiddleware } from './app/_lib/dal/dal';
import { auth } from './app/_lib/config/firebase-admin';

export const runtime = 'nodejs';

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const HOME_PATH = '/';

/**
 * Middleware för att skydda rutter och hantera omdirigeringar baserat på autentiseringsstatus och onboarding-process.
 * VERSION 2.0 - Refactored för tydlighet och robusthet.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  // Försök verifiera sessionen och hämta användarprofilen
  let userProfile = null;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
      userProfile = await getUserProfileForMiddleware(decodedToken.uid);
      isAuthenticated = !!userProfile; // Användaren är autentiserad om profilen finns
    } catch (error) {
      // Ogiltig eller utgången cookie. Vi behandlar detta som "inte inloggad".
      console.error('Middleware: Ogiltig session cookie. Rensar och omdirigerar.', error);
      const response = NextResponse.redirect(new URL(HOME_PATH, request.url));
      response.cookies.delete('__session');
      return response;
    }
  }

  const isOnboardingComplete = userProfile?.onboardingStatus === 'complete';

  // --- Omdirigeringsregler ---

  // 1. Inloggad användare är på startsidan (/
  if (isAuthenticated && pathname === HOME_PATH) {
    const targetPath = isOnboardingComplete ? DASHBOARD_PATH : ONBOARDING_PATH;
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // 2. Icke-inloggad användare försöker nå en skyddad sida
  if (!isAuthenticated && (pathname.startsWith(DASHBOARD_PATH) || pathname.startsWith(ONBOARDING_PATH))) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // 3. Inloggad användare är på fel steg i processen
  if (isAuthenticated) {
    // Försöker nå onboarding men är redan klar
    if (isOnboardingComplete && pathname.startsWith(ONBOARDING_PATH)) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }
    // Försöker nå dashboard men är INTE klar med onboarding
    if (!isOnboardingComplete && pathname.startsWith(DASHBOARD_PATH)) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
    }
  }

  // Om ingen regel matchar, fortsätt som vanligt
  return NextResponse.next();
}

export const config = {
  // Kör middleware på alla viktiga rutter för att säkerställa att ingen slinker igenom.
  matcher: [
    '/', 
    '/dashboard/:path*',
    '/onboarding',
  ],
};
