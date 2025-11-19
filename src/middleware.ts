
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserProfile } from './app/_lib/dal/dal'; // Importera DAL för databasåtkomst
import { auth } from './app/_lib/config/firebase-admin'; // Importera firebase-admin för token-verifiering

/**
 * Middleware för att skydda rutter och hantera omdirigeringar baserat på
 * autentisering och onboarding-status. Körs på servern före varje request.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value || '';

  // Om det inte finns någon session-cookie, omdirigera till login om de försöker nå en skyddad sida
  if (!sessionCookie) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/', request.url)); // Omdirigera till startsidan
    }
    return NextResponse.next();
  }

  try {
    // Verifiera session-cookien med Firebase Admin SDK
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    const userId = decodedToken.uid;

    // Hämta användarprofilen för att kontrollera onboarding-status
    const userProfile = await getUserProfile(userId);

    // Om användaren är på inloggningssidan men redan inloggad, omdirigera
    if (pathname === '/') {
        if (userProfile?.onboardingStatus === 'complete') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }
    }
    
    // Logik för omdirigering baserat på onboarding-status
    if (userProfile) {
      const isOnboardingComplete = userProfile.onboardingStatus === 'complete';

      if (pathname.startsWith('/onboarding') && isOnboardingComplete) {
        // Om de är på onboarding men har slutfört den, skicka till dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname.startsWith('/dashboard') && !isOnboardingComplete) {
        // Om de försöker nå dashboard men inte har slutfört onboarding, skicka till onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }

    // Om ingen omdirigering behövs, fortsätt till den begärda sidan
    return NextResponse.next();

  } catch (error) {
    // Om verifieringen misslyckas (t.ex. ogiltig cookie), rensa cookien och omdirigera till login
    console.error('Middleware Auth Error:', error);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('__session');
    return response;
  }
}

// Definiera vilka rutter som denna middleware ska köras på
export const config = {
  matcher: [
    '/',                   // Startsidan (för att omdirigera inloggade användare)
    '/dashboard/:path*',   // Alla sidor under dashboard
    '/onboarding',         // Onboarding-sidan
  ],
};
