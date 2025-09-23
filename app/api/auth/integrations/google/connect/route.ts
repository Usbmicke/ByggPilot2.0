
import { NextResponse } from 'next/server';

/**
 * Denna API-rutt initierar OAuth 2.0-flödet med Google.
 */
export async function GET() {
    // Värden hämtas från säkra miljövariabler.
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/integrations/google/callback';

    if (!GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID är inte konfigurerad i miljövariablerna.");
        return NextResponse.json({ message: "Serverkonfigurationsfel." }, { status: 500 });
    }

    // Definierar vilka "scopes" vi begär tillgång till. 
    // Vi begär endast läsrättigheter till att börja med, enligt "least privilege"-principen.
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events' // Behövs för att kunna skapa händelser
    ].join(' ');

    // Konstruerar URL:en för Googles medgivandesida
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline', // För att få en refresh_token så att användaren inte behöver logga in igen
        prompt: 'consent', // Visar alltid medgivandeskärmen
    });

    // --- SIMULERING ---
    // I en riktig app omdirigerar vi användaren direkt till Google.
    // Eftersom jag inte kan göra en extern omdirigering på ett säkert sätt från denna miljö,
    // loggar jag URL:en och returnerar ett meddelande. I en verklig implementation
    // skulle koden nedan vara: return NextResponse.redirect(authUrl);

    console.log('=================================================================');
    console.log('===== BYGGPILOT OAUTH FLOW (SIMULERING) =====');
    console.log(`I en verklig app skulle användaren nu omdirigeras till:`);
    console.log(authUrl);
    console.log('=================================================================');

    return NextResponse.json(
        {
            message: 'Simulerad omdirigering. I en verklig app hade du skickats till Google för att logga in. Se serverloggarna för den genererade URL:en.',
            simulatedRedirectUrl: authUrl
        }, 
        { status: 200 }
    );
    
    // Riktig implementation skulle vara:
    // return NextResponse.redirect(authUrl);
}
