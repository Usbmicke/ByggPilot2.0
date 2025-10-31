
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

const ROUTES = {
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  LOGIN: '/auth/login', 
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    logger.error('[Middleware] NEXTAUTH_SECRET är inte definierad.');
    return new Response('Internal Server Error: NEXTAUTH_SECRET is not set.', { status: 500 });
  }

  const token = await getToken({ req, secret });

  const isLoggedIn = !!token;
  const hasCompletedOnboarding = !!token?.onboardingComplete;
  
  // Loggar endast för relevanta sid-navigationer, inte alla statiska filer.
  // logger.info(`[Middleware] Path: ${pathname}, Status: ${isLoggedIn ? 'Inloggad' : 'Ej inloggad'}, Onboarding: ${hasCompletedOnboarding ? 'Klar' : 'Ej klar'}`);

  // --- Kärnlogik för omdirigering ---

  // 1. Användare som är fullständigt onboardade ska till dashboarden.
  if (isLoggedIn && hasCompletedOnboarding) {
    if (pathname.startsWith(ROUTES.ONBOARDING) || pathname.startsWith(ROUTES.LOGIN)) {
      logger.info(`[Middleware] Omdirigerar färdig användare från ${pathname} till ${ROUTES.DASHBOARD}`);
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
    }
  }

  // 2. Inloggade användare som INTE är klara med onboarding ska till onboarding-sidan.
  if (isLoggedIn && !hasCompletedOnboarding) {
    if (!pathname.startsWith(ROUTES.ONBOARDING)) {
      logger.info(`[Middleware] Omdirigerar ofullständig användare från ${pathname} till ${ROUTES.ONBOARDING}`);
      return NextResponse.redirect(new URL(ROUTES.ONBOARDING, req.url));
    }
  }

  // 3. Oinloggade användare ska skickas till startsidan om de försöker nå skyddade rutter.
  if (!isLoggedIn) {
      logger.info(`[Middleware] Omdirigerar ej inloggad användare från ${pathname} till startsidan.`);
      return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Denna middleware ska ENBART köras på applikationens huvudsidor.
     * Den skyddar dashboard och onboarding-flödet.
     * Viktigt: Den ignorerar '/' (startsidan) och alla API-rutter, statiska filer etc.
     * för att undvika att blockera NextAuth-sessioner eller andra nödvändiga anrop.
     */
    '/dashboard/:path*',
    '/onboarding/:path*',
  ],
};
