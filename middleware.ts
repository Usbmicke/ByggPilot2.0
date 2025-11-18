
// ===================================================================
// MIDDLEWARE (v3.0 - Edge-kompatibel)
// ===================================================================
// Denna middleware är designad för att köras på Next.js Edge Runtime.
// Den är lätt och snabb, och dess enda ansvar är att hantera omdirigeringar.
// All tung logik (som att verifiera sessioner med Firebase Admin)
// delegeras till en API-endpoint (/api/auth/verify).

import { NextResponse, type NextRequest } from 'next/server';

// --- Konfiguration ---

export const config = {
  // Skydda alla rutter utom de som är nödvändiga för appens funktion
  // och de som är explicit publika.
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt|browserconfig.xml).+)',
  ],
};

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const SIGN_IN_PATH = '/inloggning';
const LANDING_PAGE_PATH = '/';

// Publikt tillgängliga sidor som inte kräver inloggning.
const PUBLIC_PATHS = [LANDING_PAGE_PATH, SIGN_IN_PATH, '/integritetspolicy', '/anvandarvillkor'];

/**
 * Hjärtat i appens autentiseringsflöde.
 * Denna middleware bestämmer om en användare får tillgång till en sida eller inte.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // Bygg den fullständiga URL:en till vår verify-endpoint.
  const verifyUrl = new URL('/api/auth/verify', request.url);

  // --- Logik för publika sidor ---
  if (PUBLIC_PATHS.includes(pathname)) {
    // Om användaren har en session-cookie och försöker besöka landningssidan,
    // skicka dem direkt till dashboarden för en smidigare upplevelse.
    if (sessionCookie && pathname === LANDING_PAGE_PATH) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }
    // Annars, låt dem passera till den publika sidan.
    return NextResponse.next();
  }

  // --- Logik för skyddade sidor ---

  // Om ingen session-cookie finns, skicka omedelbart till inloggningssidan.
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
  }

  try {
    // ANROPA VÅR BACKEND för att säkert verifiera cookien.
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: sessionCookie }),
    });

    const { isAuthenticated, isOnboarded } = await response.json();

    if (!isAuthenticated) {
      // Om verifieringen misslyckas, kasta ett fel för att hamna i catch-blocket.
      throw new Error('Session verification failed');
    }

    // --- Omdirigeringslogik baserat på verifierat svar ---

    if (!isOnboarded) {
      // Om användaren inte har slutfört onboarding...
      if (pathname !== ONBOARDING_PATH) {
        // ...och de INTE är på onboarding-sidan, skicka dem dit.
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }
    } else {
      // Om användaren HAR slutfört onboarding...
      if (pathname !== DASHBOARD_PATH) {
        // ...och de inte är på dashboarden, skicka dem dit.
        // (Detta täcker även fallet där de försöker nå /onboarding igen).
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
    }

    // Om ingen omdirigering behövs (t.ex. de är redan på rätt sida), låt dem passera.
    return NextResponse.next();

  } catch (error) {
    // Om anropet till /api/auth/verify misslyckas eller om cookien är ogiltig,
    // rensa den felaktiga cookien och skicka till inloggning.
    console.error('[Middleware Error]:', error);
    const response = NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
    response.cookies.set('session', '', { maxAge: -1 }); // Rensar omedelbart
    return response;
  }
}
