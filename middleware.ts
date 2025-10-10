
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// =================================================================================
// GULDSTANDARD - Middleware V1.0
// FUNKTION: Agerar som en "gatekeeper" för hela applikationen.
// LOGIK: Kontrollerar varje inkommande förfrågan. Om användaren är autentiserad
// men INTE har slutfört onboarding (`onboardingComplete: false`), tvingas de
// till `/onboarding`-sidan. Detta säkerställer ett korrekt och robust flöde för alla nya användare.
// =================================================================================

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const { pathname } = req.nextUrl;

    // Om användaren är inloggad (har ett token) och inte har slutfört onboarding
    if (token && !token.onboardingComplete) {
        // Om de redan är på onboardingsidan, låt dem vara. Annars, omdirigera dem dit.
        if (pathname !== '/onboarding') {
            return NextResponse.redirect(new URL('/onboarding', req.url));
        }
    }

    // Om användaren är inloggad och HAR slutfört onboarding
    if (token && token.onboardingComplete) {
        // Om de försöker besöka onboardingsidan igen, skicka dem till dashboard.
        if (pathname === '/onboarding') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // Om användaren inte är inloggad och försöker nå en skyddad sida
    if (!token && pathname.startsWith('/dashboard')) {
        // Skicka dem till inloggningssidan (eller hemsidan)
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Låt förfrågan passera om ingen av ovanstående regler matchar
    return NextResponse.next();
}

// Konfiguration för vilka sökvägar denna middleware ska köras på
export const config = {
    matcher: [
        /*
         * Matcha alla sökvägar förutom:
         * - API-anrop (api)
         * - Next.js interna filer (_next)
         * - Statiska filer (favicon.ico, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
