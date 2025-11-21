
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, getUserProfileForMiddleware } from './app/_lib/dal/dal';

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const HOME_PATH = '/';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  console.log(`[Proxy]: Path: ${pathname}, Har cookie: ${!!sessionCookie}`);

  let session = null;
  try {
    session = await verifySession(sessionCookie);
    console.log('[Proxy]: Session verifierad framgångsrikt.');
  } catch (error) {
    // ================== AVGÖRANDE LOGGNING ==================
    // Om sessionen misslyckas, logga exakt varför.
    console.error('[Proxy ERROR]: Session-verifiering misslyckades. Orsak:', error);
    // =======================================================

    if (pathname.startsWith(DASHBOARD_PATH) || pathname.startsWith(ONBOARDING_PATH)) {
      const response = NextResponse.redirect(new URL(HOME_PATH, request.url));
      response.cookies.delete('__session');
      return response;
    }
    return NextResponse.next();
  }

  const userProfile = await getUserProfileForMiddleware(session.userId);

  if (!userProfile) {
      console.warn('[Proxy]: Användarprofil saknas trots giltig session. Skickar till login.');
      const response = NextResponse.redirect(new URL(HOME_PATH, request.url));
      response.cookies.delete('__session');
      return response;
  }

  const isOnboardingComplete = userProfile.onboardingStatus === 'complete';
  console.log(`[Proxy]: Onboarding klar: ${isOnboardingComplete}`);

  if (pathname === HOME_PATH) {
    const targetPath = isOnboardingComplete ? DASHBOARD_PATH : ONBOARDING_PATH;
    console.log(`[Proxy]: På startsidan, omdirigerar till ${targetPath}`);
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  if (isOnboardingComplete && pathname.startsWith(ONBOARDING_PATH)) {
    console.log('[Proxy]: Klar med onboarding, skickas till dashboard.');
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (!isOnboardingComplete && pathname.startsWith(DASHBOARD_PATH) && !pathname.startsWith(ONBOARDING_PATH)) {
    console.log('[Proxy]: Inte klar med onboarding, skickas dit.');
    return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/onboarding',
  ],
};
