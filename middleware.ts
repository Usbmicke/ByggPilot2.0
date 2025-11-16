
import { NextResponse, type NextRequest } from 'next/server';
import { getFirebaseAdmin } from './lib/config/firebase-admin';

// Denna middleware agerar som en dörrvakt för hela applikationen.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Definiera publika vägar som inte kräver autentisering.
  const publicPaths = ['/', '/policy', '/terms'];

  // API-vägar för autentisering är också publika.
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Om vägen är publik, låt anropet passera direkt.
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Hämta session-cookien.
  const sessionCookie = request.cookies.get('session');

  // --- Fall 1: Ingen session-cookie --- 
  if (!sessionCookie) {
    console.log('Middleware: No session cookie found. Redirecting to home.');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- Fall 2: Session-cookie finns, verifiera den --- 
  try {
    const admin = await getFirebaseAdmin();
    // Verifiera cookien. Detta kastar ett fel om den är ogiltig.
    await admin.auth().verifySessionCookie(sessionCookie.value, true /** checkRevoked */);
    
    // Om vi kommer hit är cookien giltig. Låt anropet passera.
    // console.log('Middleware: Valid session cookie. Allowing request.');
    return NextResponse.next();

  } catch (error) {
    // --- Fall 3: Cookien är ogiltig (utgången, manipulerad, etc.) ---
    console.log('Middleware: Invalid session cookie. Redirecting to home.', error);
    // Omdirigera till startsidan. Ett nytt försök att logga in krävs.
    const response = NextResponse.redirect(new URL('/', request.url));
    // Radera den ogiltiga cookien från webbläsaren.
    response.cookies.delete('session');
    return response;
  }
}

// Konfigurera vilka vägar denna middleware ska köras på.
export const config = {
  matcher: [
    // Matcha alla vägar FÖRUTOM de som är uppenbart statiska filer.
    // Detta säkerställer att alla sidor och API-anrop skyddas.
    '/((?!_next/static|favicon.ico).*)',
  ],
};
