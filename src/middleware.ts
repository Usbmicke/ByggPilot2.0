
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, getUserProfileForMiddleware } from './app/_lib/dal/dal'; // Importera verifySession

export const runtime = 'nodejs';

const ONBOARDING_PATH = '/dashboard/onboarding';
const DASHBOARD_PATH = '/dashboard';
const HOME_PATH = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  let session = null;
  try {
    // Använd den nya centrala verifieringsfunktionen.
    // Om den kastar ett fel, fångas det i catch-blocket.
    session = await verifySession(sessionCookie);
  } catch (error) {
    // Detta innebär att sessionen är ogiltig eller saknas.
    // Om användaren är på en skyddad sida, skicka till startsidan.
    if (pathname.startsWith(DASHBOARD_PATH)) {
      const response = NextResponse.redirect(new URL(HOME_PATH, request.url));
      response.cookies.delete('__session');
      return response;
    }
    // Annars, låt dem vara (t.ex. på startsidan).
    return NextResponse.next();
  }

  // Om vi kommer hit är användaren autentiserad.
  const userProfile = await getUserProfileForMiddleware(session.userId);

  // Säkerhets-check: Om profilen av någon anledning inte finns, agera som utloggad.
  if (!userProfile) {
      const response = NextResponse.redirect(new URL(HOME_PATH, request.url));
      response.cookies.delete('__session');
      return response;
  }

  const isOnboardingComplete = userProfile.onboardingStatus === 'complete';

  // --- Omdirigeringsregler för inloggade användare ---

  // 1. På startsidan -> Skicka till rätt ställe.
  if (pathname === HOME_PATH) {
    const targetPath = isOnboardingComplete ? DASHBOARD_PATH : ONBOARDING_PATH;
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // 2. Försöker nå onboarding men är redan klar -> Skicka till dashboard.
  if (isOnboardingComplete && pathname.startsWith(ONBOARDING_PATH)) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  // 3. Försöker nå dashboard men är INTE klar -> Skicka till onboarding.
  if (!isOnboardingComplete && pathname.startsWith(DASHBOARD_PATH) && !pathname.startsWith(ONBOARDING_PATH)) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', 
    '/dashboard/:path*',
  ],
};
