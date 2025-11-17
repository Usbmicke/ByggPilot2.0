// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: [
    /* Matcha allt FÖRUTOM api-rutter och statiska filer */
    '/((?!api/|_next/static|_next/image|favicon.ico|images).*)',
  ],
};

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const ROOT_PATH = '/';
const PUBLIC_PATHS = ['/integritetspolicy', '/anvandarvillkor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const absoluteURL = new URL('/', request.nextUrl.origin);

  // Anropa din säkra Node.js-rutt
  const verifyResponse = await fetch(new URL('/api/auth/verify', absoluteURL), {
    headers: { cookie: request.headers.get('cookie') || '' },
  });

  if (!verifyResponse.ok) {
     // Om verify-APIt kraschar (t.ex. 401, 500), agera som oinloggad
     const response = NextResponse.redirect(new URL(ROOT_PATH, request.url));
     response.cookies.set('session', '', { maxAge: -1, path: '/' }); // Rensa trasig cookie
     return response;
  }
  
  const { isAuthenticated, isOnboarded } = await verifyResponse.json();

  // --- Din omdirigeringslogik (Denna var redan perfekt) ---
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
      return NextResponse.redirect(new URL(ROOT_PATH, request.url));
    }
  }

  return NextResponse.next();
}
