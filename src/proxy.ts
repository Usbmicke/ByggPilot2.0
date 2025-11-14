import { NextResponse, type NextRequest } from 'next/server';

// RÄTTELSE: Middleware/Proxy kan inte använda Firebase SDK direkt.
// Vi måste läsa cookien.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hämta Firebase Auth-cookien (om den finns)
  const sessionCookie = request.cookies.get('session')?.value;

  // Definiera våra sidor
  const publicPaths = ['/'];
  const protectedPaths = ['/dashboard', '/onboarding'];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isPublic = publicPaths.includes(pathname);

  // FALL 1: Ingen session-cookie OCH försöker nå skyddad sida
  if (!sessionCookie && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/'; // Skicka till landningssidan
    return NextResponse.redirect(url);
  }

  // FALL 2: Har en session-cookie OCH är på en offentlig sida
  if (sessionCookie && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard'; // Skicka till dashboard
    return NextResponse.redirect(url);
  }

  // I alla andra fall, låt användaren passera
  return NextResponse.next();
}
