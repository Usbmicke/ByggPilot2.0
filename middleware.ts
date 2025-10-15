
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// =================================================================================
// GULDSTANDARD - MIDDLEWARE V3.0
// ARKITEKTUR: Denna version är designad för att vara extremt robust och förhindra
// de oändliga omdirigeringsloopar som kan uppstå när sessionens status är
// osynkroniserad med användarens faktiska data i databasen.
//
// LÖSNING:
// 1. **IGNORERA /onboarding:** Om användaren redan är på /onboarding, gör
//    ingenting. Detta är den viktigaste ändringen för att bryta loopar direkt
//    efter att onboardingen är slutförd.
// 2. **SÄKRARE KONTROLLER:** Logiken är nu mer strikt och agerar bara när
//    sessionstoken (`token`) är fullständigt definierad och har ett känt
//    onboarding-tillstånd.
// 3. **TYDLIGARE FLÖDE:** Separata `if`-block för varje scenario gör koden
//    lättare att förstå och felsöka.
// =================================================================================

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        const { pathname } = request.nextUrl;
        const { token } = request.nextauth;

        // Om vi är på onboarding-sidan, gör ingenting och låt sidan renderas.
        // Detta förhindrar omdirigeringsloopar.
        if (pathname.startsWith('/onboarding')) {
            return NextResponse.next();
        }

        // Om användaren är autentiserad och har en token...
        if (token) {
            // ...men INTE har slutfört onboarding, skicka till onboarding-sidan.
            if (token.onboardingComplete === false) {
                return NextResponse.redirect(new URL('/onboarding', request.url));
            }

            // Om användaren är på startsidan och HAR slutfört onboarding, skicka till dashboard.
            if (pathname === '/' && token.onboardingComplete === true) {
                 return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        // I alla andra fall (t.ex. användare på skyddade sidor med giltig token),
        // fortsätt som vanligt.
        return NextResponse.next();
    },
    {
        callbacks: {
            // Denna callback avgör om middleware-funktionen överhuvudtaget ska köras.
            // Vi vill att den ska köras på alla sidor FÖRUTOM rena API-anrop, bildfiler etc.
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;
                
                // Kör alltid middleware för vanliga sidor.
                // Ignorera för api, next, och fil-requests.
                if (pathname.startsWith('/api') || 
                    pathname.startsWith('/_next') || 
                    pathname.includes('.')) {
                    return true; // Ignorera inte, men låt passera utan redirect-logik
                }
                
                // Om det finns en token (användaren är inloggad), kör alltid middleware-logiken.
                return !!token;
            },
        },
    }
);
