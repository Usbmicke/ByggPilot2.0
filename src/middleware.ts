
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// =================================================================================
// MIDDLEWARE V3.0 - Korrekt Logik för Färdiga Användare
// =================================================================================
// Denna version korrigerar den kritiska logiska luckan som felaktigt
// skickade tillbaka färdiga användare till onboarding-sidan.

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const hasCompletedOnboarding = token?.hasCompletedOnboarding as boolean | undefined;
  const isAuthenticated = !!token;

  // Om användaren INTE är autentiserad, skicka till inloggningssidan
  // (undantaget är rot-pathen som kan vara en publik landningssida).
  if (!isAuthenticated && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // --- LOGIK FÖR AUTENTISERADE ANVÄNDARE ---
  if (isAuthenticated) {
    const isOnboardingPage = pathname.startsWith('/onboarding');

    // Fall 1: Användaren har INTE slutfört onboarding.
    if (!hasCompletedOnboarding) {
      // Skicka dem till onboarding-sidan om de inte redan är där.
      if (!isOnboardingPage) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    } 
    // Fall 2: Användaren HAR slutfört onboarding.
    else {
      // Om de försöker besöka onboarding-sidan igen, skicka dem till dashboard.
      if (isOnboardingPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // Om de besöker inloggningssidan, skicka till dashboard.
      if (pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  // Om ingen av specialreglerna ovan matchar, tillåt passering.
  return NextResponse.next();
}

// Matchern applicerar denna logik på alla relevanta sidor.
export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/login', '/'],
};
