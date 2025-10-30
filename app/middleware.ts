
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

// 1. ANGE SKYDDADE OCH OFFENTLIGA SIDOR
// ==================================================
const protectedRoutes = ['/dashboard']; // Sidor som kräver fullständig onboarding
const publicRoutes = ['/login', '/', '/onboarding']; // Sidor som alltid är tillgängliga

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 2. HÄMTA SESSIONSTOKEN
    // ==================================================
    // Använder den rekommenderade metoden getToken för att säkert läsa JWT.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    logger.info(`[Middleware] Path: ${pathname}, Token: ${token ? 'Present' : 'Absent'}`);

    // 3. LOGIK FÖR Omdirigering
    // ==================================================

    // Om användaren är inloggad (har ett token)
    if (token) {
        const onboardingComplete = token.onboardingComplete === true;
        logger.info(`[Middleware] User: ${token.sub}, Onboarding Complete: ${onboardingComplete}`);

        // Fall A: Användaren har INTE slutfört onboarding
        if (!onboardingComplete) {
            // Om de försöker nå en skyddad sida, tvinga dem till onboarding.
            if (protectedRoutes.some(p => pathname.startsWith(p))) {
                logger.info(`[Middleware] Redirecting to /onboarding (user not onboarded)`);
                return NextResponse.redirect(new URL('/onboarding', req.url));
            }
        }

        // Fall B: Användaren HAR slutfört onboarding
        else {
            // Om de är på onboarding-sidan, omdirigera dem till dashboard.
            // Detta förhindrar att de fastnar i onboarding-loopen.
            if (pathname.startsWith('/onboarding')) {
                logger.info(`[Middleware] Redirecting to /dashboard (user already onboarded)`);
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }
    }

    // Om användaren INTE är inloggad (inget token)
    else {
        // Om de försöker nå en skyddad sida, omdirigera dem till inloggningen.
        if (protectedRoutes.some(p => pathname.startsWith(p))) {
            logger.warn(`[Middleware] Unauthorized access to ${pathname}, redirecting to /`);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // 4. INGEN ÅTGÄRD BEHÖVS
    // ==================================================
    // Om ingen av ovanstående regler matchar (t.ex. offentliga sidor), fortsätt som vanligt.
    return NextResponse.next();
}

// 5. MATCHER CONFIG
// ==================================================
// Specificerar vilka sökvägar denna middleware ska köras på.
// Vi undviker att köra den på statiska filer (_next), bilder, etc. för prestanda.
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
