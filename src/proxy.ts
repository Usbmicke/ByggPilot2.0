
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

const ROUTES = {
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  LOGIN: '/login',
};

/**
 * Middleware (Proxy) v7 - Förenklad
 * Eftersom navigering från onboarding nu hanteras av en knapp med en fullständig sidladdning,
 * är "Token Gate"-logiken inte längre nödvändig. Denna proxy återgår till sin kärnuppgift:
 * att skydda rutter och omdirigera användare baserat på deras sessionsstatus (inloggad/onboardad).
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    logger.error('[Proxy] NEXTAUTH_SECRET är inte definierad.');
    return new Response('Internal Server Error', { status: 500 });
  }

  const token = await getToken({ req, secret });

  const isLoggedIn = !!token;
  const hasCompletedOnboarding = !!token?.onboardingComplete;
  
  logger.info(`[Proxy] Path: ${pathname}, Status: ${isLoggedIn ? 'Inloggad' : 'Ej inloggad'}, Onboarding: ${hasCompletedOnboarding ? 'Klar' : 'Ej klar'}`);

  // --- STANDARD ROUTING-REGLER ---

  // Användare som är KLAR med onboarding ska vara på dashboarden.
  // Skicka bort dem från onboarding- eller inloggningssidorna.
  if (isLoggedIn && hasCompletedOnboarding) {
    if (pathname.startsWith(ROUTES.ONBOARDING) || pathname.startsWith(ROUTES.LOGIN)) {
      logger.info(`[Proxy] Omdirigerar färdig användare från ${pathname} till ${ROUTES.DASHBOARD}`);
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
    }
  }

  // Användare som INTE är klar med onboarding ska vara på onboardingen.
  // Skydda alla andra rutter.
  if (isLoggedIn && !hasCompletedOnboarding) {
    if (!pathname.startsWith(ROUTES.ONBOARDING) && pathname !== '/login') {
      logger.info(`[Proxy] Omdirigerar ofullständig användare från ${pathname} till ${ROUTES.ONBOARDING}`);
      return NextResponse.redirect(new URL(ROUTES.ONBOARDING, req.url));
    }
  }

  // Oinloggade användare får endast besöka publika sidor.
  // Skydda alla andra rutter.
  if (!isLoggedIn) {
    const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.ONBOARDING];
    if (protectedRoutes.some(p => pathname.startsWith(p))) {
        logger.info(`[Proxy] Omdirigerar ej inloggad användare från ${pathname} till ${ROUTES.LOGIN}`);
        return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
