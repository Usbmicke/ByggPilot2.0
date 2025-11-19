
// ===================================================================
// MIDDLEWARE (v3.2 - Firebase Auth Flow Fix)
// ===================================================================
// Denna middleware är designad för att köras på Next.js Edge Runtime.
// Den är lätt och snabb, och dess enda ansvar är att hantera omdirigeringar.
// All tung logik (som att verifiera sessioner med Firebase Admin)
// delegeras till en API-endpoint (/api/auth/verify).

import { NextResponse, type NextRequest } from 'next/server';

// --- Konfiguration ---

export const config = {
  // Skydda alla rutter utom de som är nödvändiga för appens funktion
  // och de som är explicit publika. Notera det viktiga undantaget för
  // 'api/auth/session' för att tillåta klienten att skapa en session.
  matcher: [
    '/((?!api/auth/session|api/auth/verify|_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt|browserconfig.xml).+)',
  ],
};

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const SIGN_IN_PATH = '/'; // Ändrad till landningssidan
const LANDING_PAGE_PATH = '/';

// Publikt tillgängliga sidor som inte kräver inloggning.
const PUBLIC_PATHS = [LANDING_PAGE_PATH, '/integritetspolicy', '/anvandarvillkor'];

/**
 * Hjärtat i appens autentiseringsflöde.
 * Denna middleware bestämmer om en användare får tillgång till en sida eller inte.
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // ===================== NYTT: Firebase Auth Flow Undantag =====================
  // Om URL:en innehåller parametrar som tyder på en pågående Firebase-inloggning
  // (efter redirect från Google), låt requesten passera HELT utan åtgärd.
  // Detta låter Firebase-klienten på landningssidan slutföra inloggningen och
  // skapa session-cookien via /api/auth/session.
  const isFirebaseAuthFlow = searchParams.has('mode') && searchParams.has('oobCode');
  if (isFirebaseAuthFlow) {
    return NextResponse.next();
  }
  // ==========================================================================

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

    // Om verifierings-API:et självt misslyckas, kasta ett fel.
    if (!response.ok) {
        throw new Error(`Verification API failed with status: ${response.status}`);
    }

    const { isAuthenticated, isOnboarded } = await response.json();

    if (!isAuthenticated) {
      // Om verifieringen returnerar att användaren inte är autentiserad.
      throw new Error('Session verification returned isAuthenticated: false');
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
      if (pathname.startsWith(DASHBOARD_PATH)) {
          // Om de redan är på en dashboard-sida, låt dem vara.
          return NextResponse.next();
      } else {
          // Annars, skicka dem till huvuddashboarden.
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
