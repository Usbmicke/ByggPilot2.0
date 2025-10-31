
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// =================================================================================
// MIDDLEWARE V2.0 - INTELLIGENT DIRIGERING
// =================================================================================
// Denna middleware styr trafiken baserat på användarens onboarding-status.

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const hasCompletedOnboarding = token?.hasCompletedOnboarding as boolean | undefined;
  const isAuthenticated = !!token;

  // Om användaren är på inloggningssidan
  if (pathname.startsWith('/login')) {
    // Om de redan är inloggade och har slutfört onboarding, skicka till dashboard
    if (isAuthenticated && hasCompletedOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Om de är inloggade men INTE slutfört onboarding, skicka till onboarding
    if (isAuthenticated && !hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    // Annars, låt dem vara kvar på inloggningssidan
    return NextResponse.next();
  }

  // Om användaren INTE är autentiserad, omdirigera till inloggningssidan
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Logik för autentiserade användare
  const isOnboardingPage = pathname.startsWith('/onboarding');

  // Fall 1: Användaren har INTE slutfört onboarding.
  if (!hasCompletedOnboarding) {
    // Om de inte redan är på onboarding-sidan, skicka dit dem.
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
  }

  // Om ingen av reglerna ovan matchar, fortsätt som vanligt.
  return NextResponse.next();
}

// Denna middleware appliceras på alla relevanta sidor.
export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/login'],
};
