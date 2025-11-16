
import { NextResponse, type NextRequest } from 'next/server';

// 1. Ange vilka sökvägar denna Middleware ska köras på.
// Vi vill skydda /dashboard och /onboarding, men ignorera allt annat (API-anrop, statiska filer etc.)
export const config = {
  matcher: ['/', '/dashboard/:path*', '/onboarding'],
};

async function verifySession(request: NextRequest): Promise<{ isAuthenticated: boolean; isOnboarded: boolean }> {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) {
    return { isAuthenticated: false, isOnboarded: false };
  }

  // Anropa vår säkra, isolerade API-väg för att verifiera cookien.
  // Vi använder den absoluta URL:en för att det ska fungera både lokalt och i produktion.
  const url = new URL('/api/auth/verify-session', request.url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionCookie }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      // Om API-anropet misslyckas, anta att användaren inte är autentiserad.
      return { isAuthenticated: false, isOnboarded: false };
    }
  } catch (error) {
    console.error('[Middleware] Nätverksfel vid verifiering av session:', error);
    return { isAuthenticated: false, isOnboarded: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Anropa funktionen som verifierar sessionen via vår API-väg
  const { isAuthenticated, isOnboarded } = await verifySession(request);

  const isPublicRoot = pathname === '/';
  const isOnboarding = pathname === '/onboarding';
  const isDashboard = pathname.startsWith('/dashboard');

  // Scenario 1: Användaren är inloggad och har slutfört onboarding.
  if (isAuthenticated && isOnboarded) {
    // Om de försöker besöka landningssidan eller onboarding, skicka dem till dashboard.
    if (isPublicRoot || isOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Scenario 2: Användaren är inloggad men har INTE slutfört onboarding.
  else if (isAuthenticated && !isOnboarded) {
    // Om de inte redan är på onboarding-sidan, tvinga dem dit.
    if (!isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Scenario 3: Användaren är INTE inloggad.
  else if (!isAuthenticated) {
    // Om de försöker komma åt en skyddad sida, skicka dem till landningssidan.
    if (isDashboard || isOnboarding) {
      const response = NextResponse.redirect(new URL('/', request.url));
      // En extra säkerhetsåtgärd: se till att en eventuell ogiltig cookie tas bort.
      response.cookies.delete('session');
      return response;
    }
  }

  // Om ingen av reglerna ovan matchar, låt användaren passera.
  return NextResponse.next();
}
