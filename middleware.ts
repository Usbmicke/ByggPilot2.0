import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '@/config/env'; // <-- KORREKT IMPORT

// =================================================================================
// Middleware V5.0 (ARKITEKTONISKT KORREKT)
// ARKITEKTUR: Denna version anpassar middleware till den nya, säkra arkitekturen.
//
// ROTORSAK: Middleware använde `process.env.NEXTAUTH_SECRET` direkt, vilket är
// `undefined` i den nya arkitekturen. Detta orsakade en krasch på servern.
//
// LÖSNING: Importerar och använder `env.NEXTAUTH_SECRET` från den centraliserade,
// Zod-validerade miljöfilen. Detta säkerställer att middleware har tillgång till
// rätt hemlighet och kan dekryptera JWT-tokens korrekt.
// =================================================================================

const protectedRoutes = ['/dashboard', '/onboarding'];

export async function middleware(req: NextRequest) {
    // KORREKT: Använd den validerade hemligheten från `env`-objektet.
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isAuthenticated = !!token;
    const isOnboardingComplete = token?.onboardingComplete as boolean;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!isAuthenticated && isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (isAuthenticated && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (isAuthenticated && !isOnboardingComplete && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    if (isAuthenticated && isOnboardingComplete && pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
