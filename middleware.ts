
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// =================================================================================
// Middleware V3.0 (ROBUST & FÖRENKLAD)
// ARKITEKTUR: Denna version är säkrare och mer robust genom att vara "state-agnostisk".
// 1. **Aggressivt skydd:** Den blockerar ALLA definierade skyddade rutter för oinloggade användare.
// 2. **State-agnostisk:** Den förlitar sig INTE längre på JWT-token för onboarding-status,
//    vilket löser problemet med föråldrad data i cookien. Sidans egen logik (`OnboardingPage`
//    eller `DashboardPage`) ansvarar nu för att hämta aktuell status från databasen.
//    Detta är ett mer pålitligt mönster.
// =================================================================================

const protectedRoutes = ['/dashboard', '/onboarding'];

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isAuthenticated = !!token;

    // Kontrollera om den begärda sökvägen är en skyddad route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // FALL 1: Oinloggad användare försöker nå en skyddad sida
    if (!isAuthenticated && isProtectedRoute) {
        // Omdirigera till startsidan/inloggningssidan
        return NextResponse.redirect(new URL('/', req.url));
    }

    // FALL 2: Inloggad användare är på startsidan (inloggningssidan)
    if (isAuthenticated && pathname === '/') {
        // Skicka dem direkt till dashboarden. De är redan inloggade.
        // Notera: Dashboard-sidan kommer själv att hantera omdirigering till /onboarding om det behövs.
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Låt alla andra förfrågningar passera
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
