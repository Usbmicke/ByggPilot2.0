
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// =================================================================================
// GULDSTANDARD - Middleware V2.0 (INTELLIGENT ROUTING)
// ARKITEKTUR: Uppdaterad logik för att hantera flerstegs-onboarding.
// Genom att nu läsa `onboardingStep` från JWT-token, kan middlewaren skilja på
// en användare som *startat* men inte *slutfört* sin onboarding. Detta löser
// den kritiska buggen där användare fastnade i en loop på `/onboarding`.
// =================================================================================

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isAuthenticated = !!token;
    const isOnboardingPage = pathname === '/onboarding';
    const isOnboardingComplete = token?.onboardingComplete ?? false;

    // Om användaren är inloggad
    if (isAuthenticated) {
        // FALL 1: Onboarding är INTE slutförd
        if (!isOnboardingComplete) {
            // Om de försöker nå någon annan sida än onboarding-sidan, tvinga dem dit.
            // Detta säkerställer att nya användare måste slutföra processen.
            if (!isOnboardingPage) {
                return NextResponse.redirect(new URL('/onboarding', req.url));
            }
        }
        // FALL 2: Onboarding ÄR slutförd
        else {
            // Om de av någon anledning försöker besöka onboarding-sidan igen,
            // skicka dem direkt till dashboarden. De är ju redan klara.
            if (isOnboardingPage) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }
    }
    // FALL 3: Användaren är INTE inloggad
    else {
        // Om en oinloggad användare försöker nå en skyddad sida (som dashboarden),
        // skicka dem till startsidan för att logga in.
        if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Om ingen av reglerna ovan matchar, låt förfrågan passera.
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
