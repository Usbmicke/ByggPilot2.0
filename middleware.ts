
import { NextResponse } from 'next/server';
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth.token;
    const { pathname } = request.nextUrl;

    const isOnboardingComplete = token?.onboardingComplete === true;
    const isTryingToAccessApp = pathname.startsWith('/dashboard');
    const isOnboardingPage = pathname.startsWith('/onboarding');

    // Scenario 1: Användaren har slutfört onboarding.
    if (isOnboardingComplete) {
      // Om de försöker komma åt onboarding-sidan, skicka dem till dashboarden.
      if (isOnboardingPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Om de är på väg till dashboard eller någon annan skyddad sida, låt dem passera.
      return NextResponse.next();
    }

    // Scenario 2: Användaren har INTE slutfört onboarding.
    if (!isOnboardingComplete) {
      // Om de försöker komma åt appen (dashboard), tvinga dem till onboarding.
      if (isTryingToAccessApp) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      // Om de redan är på onboarding-sidan, låt dem vara kvar.
      return NextResponse.next();
    }

    // Fallback: borde teoretiskt sett inte nås, men för säkerhets skull.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Körs innan middleware-funktionen. Säkerställer att ett giltigt token finns.
      // Om inte, omdirigeras användaren till inloggningssidan (hanteras av withAuth).
      authorized: ({ token }) => !!token,
    },
  }
);

// GULDSTANDARD-FIX: Matchern täcker nu ALLA skyddade vägar.
// Detta är den centrala punkten som säkerställer att ingen obehörig når kärnapplikationen.
export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*'],
};
