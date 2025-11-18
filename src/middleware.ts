
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from './firebase-admin'; // Importerar den nya, centraliserade admin-konfigurationen

export const config = {
    // Skyddar alla rutter utom de som är explicit undantagna (API, Next.js-interna filer etc.)
    // Detta säkerställer att hela appen är skyddad som standard.
    matcher: [
      '/((?!api/|_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt|browserconfig.xml).+)',
    ],
};

const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';
const LANDING_PAGE_PATH = '/';
const SIGN_IN_PATH = '/inloggning'; // En dedikerad inloggningssida är bättre praxis

// Publikt tillgängliga sidor som inte kräver inloggning
const PUBLIC_PATHS = [LANDING_PAGE_PATH, SIGN_IN_PATH, '/integritetspolicy', '/anvandarvillkor'];

/**
 * Hjärtat i den nya, säkra autentiseringsarkitekturen.
 * Denna middleware körs på servern innan någon sid-rendering.
 * Den är ansvarig för att:
 * 1. Validera användarens session-cookie.
 * 2. Hämta användarens data (inkl. `isOnboarded`-status) från Firestore.
 * 3. Dirigera om användaren baserat på deras autentiserings- och onboarding-status.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Hoppa över middleware för publika sidor för att undvika omdirigeringsloopar.
    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    try {
        // 1. FÖRSÖK VALIVERA SESSIONEN
        // Hämta den session-cookie som Firebase automatiskt sätter.
        const sessionCookie = request.cookies.get('session')?.value;
        if (!sessionCookie) {
            // Om ingen cookie finns, skicka till inloggningssidan.
            return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
        }

        // Verifiera cookien med Firebase Admin SDK. Detta är en säker server-side-validering.
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

        // 2. HÄMTA ANVÄNDARDATA FRÅN FIRESTORE
        // Nu när vi vet att användaren är giltig, hämtar vi deras profil.
        const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
            // Om användaren finns i Auth men inte i Firestore (ett edge case), skicka till inloggning.
            // Vi kan också välja att skapa användaren här om det är önskvärt.
            throw new Error('Användare finns inte i Firestore.');
        }

        const { isOnboarded } = userDoc.data() as { isOnboarded?: boolean };

        // 3. IMPLEMENTERA OMDIRIGERINGSLOGIK
        // Användaren är autentiserad. Nu bestämmer vi vart de ska.

        if (!isOnboarded) {
            // Om användaren inte har slutfört onboarding...
            if (pathname !== ONBOARDING_PATH) {
                // ...och de INTE är på onboarding-sidan, skicka dem dit.
                return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
            }
        } else {
            // Om användaren HAR slutfört onboarding...
            if (pathname === ONBOARDING_PATH || pathname === LANDING_PAGE_PATH) {
                // ...och de försöker nå onboarding-sidan eller landningssidan, skicka dem till dashboard.
                return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
            }
        }
        
        // Om ingen av omdirigeringsreglerna matchar, låt dem gå till den sida de begärde.
        return NextResponse.next();

    } catch (error) {
        // Om `verifySessionCookie` misslyckas (t.ex. ogiltig/utgången cookie), 
        // eller om något annat fel uppstår, rensa den felaktiga cookien och skicka till inloggning.
        console.error('[Middleware Error]:', error);
        const response = NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
        response.cookies.set('session', '', { maxAge: -1 }); // Rensar den gamla cookien
        return response;
    }
}
