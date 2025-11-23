
import { NextResponse, type NextRequest } from 'next/server';

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const HOME_PATH = '/';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;
  const verificationApiUrl = new URL('/api/auth/verify', request.url);

  // Om det inte finns någon cookie och användaren försöker nå en skyddad sida
  if (!sessionCookie && (pathname.startsWith(DASHBOARD_PATH) || pathname.startsWith(ONBOARDING_PATH))) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // Om det finns en cookie, verifiera den via den nya API-rutten
  if (sessionCookie) {
    const headers = new Headers({
        'Cookie': `__session=${sessionCookie}`
    });
    const response = await fetch(verificationApiUrl, { headers });

    if (response.ok) {
      const { isAuthenticated, isOnboardingComplete } = await response.json();

      if (isAuthenticated) {
        // Användaren är autentiserad, nu gör vi rätt omdirigeringar
        if (pathname === HOME_PATH) {
            const target = isOnboardingComplete ? DASHBOARD_PATH : ONBOARDING_PATH;
            return NextResponse.redirect(new URL(target, request.url));
        }
        if (pathname.startsWith(DASHBOARD_PATH) && !isOnboardingComplete) {
            return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
        }
        if (pathname === ONBOARDING_PATH && isOnboardingComplete) {
            return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
        }
        return NextResponse.next(); // Allt ok, fortsätt till den begärda sidan
      }
    }
  }

  // Om inget annat matchar, låt begäran passera.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/onboarding/:path*',
    // Vi exkluderar API-rutter från att trigga proxyn för att undvika oändliga loopar.
    // Dock hanterar Next.js detta ganska bra, men det är en bra säkerhetsåtgärd.
    // I det här fallet är det inte strikt nödvändigt eftersom vi bara matchar specifika sidor.
  ],
};
