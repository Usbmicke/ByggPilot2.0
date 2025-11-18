// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|images).*)',
  ],
};

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const ROOT_PATH = '/';
const PUBLIC_PATHS = ['/integritetspolicy', '/anvandarvillkor'];

export async function middleware(request: NextRequest) {
  // Logg från din plan
  console.log(`[MIDDLEWARE]: Startar. Sökväg: ${request.nextUrl.pathname}`);
  
  const { pathname } = request.nextUrl;
  const absoluteURL = new URL('/', request.nextUrl.origin);

  // Logg från din plan
  console.log('[MIDDLEWARE]: Anropar /api/auth/verify...');
  const verifyResponse = await fetch(new URL('/api/auth/verify', absoluteURL), {
    headers: { cookie: request.headers.get('cookie') || '' },
    cache: 'no-store',
  });

  // Logg från din plan
  const jsonResponse = await verifyResponse.json();
  console.log(`[MIDDLEWARE]: Svar från verify: status=${verifyResponse.status}, body=${JSON.stringify(jsonResponse)}`);
  const { isAuthenticated, isOnboarded } = jsonResponse;

  // --- Omdirigeringslogik ---
  if (isAuthenticated) {
    if (!isOnboarded) {
      if (pathname !== ONBOARDING_PATH) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }
    } else {
      if (pathname === ONBOARDING_PATH || pathname === ROOT_PATH) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
    }
  } else {
    const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === ROOT_PATH;
    if (!isPublic) {
      const response = NextResponse.redirect(new URL(ROOT_PATH, request.url));
      response.cookies.set('session', '', { maxAge: -1 }); 
      return response;
    }
  }

  return NextResponse.next();
}