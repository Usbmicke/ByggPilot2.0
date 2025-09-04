
import { NextResponse } from 'next/server';
import { getGoogleTokens } from '@/app/services/googleApiService';

// Denna slutpunkt hanterar callback-anropet från Googles samtyckesskärm.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Om ingen kod finns, har användaren troligen nekat åtkomst.
    return NextResponse.redirect(new URL('/?error=google_auth_denied', request.url));
  }

  try {
    // Byt ut koden mot access och refresh tokens.
    const tokens = await getGoogleTokens(code);

    // --- SÄKER TOKEN-HANTERING (PLATSHÅLLARE) ---
    // Detta är ett kritiskt steg. Tokens måste sparas säkert.
    // 1. **Session-lagring (temporärt):** Lagra tokens i användarens session så de kan användas direkt.
    //    I en riktig applikation använder man ett bibliotek som Next-Auth eller Iron-sessions för detta.
    // 2. **Databas-lagring (långsiktigt):** Spara framförallt refresh_token i din databas (t.ex. Firestore),
    //    krypterat, och kopplat till användarens ID. Detta låter appen agera på användarens vägnar offline.

    console.log('Mottagna Google Tokens:', tokens); 
    // OBS: Logga aldrig tokens i en produktionsmiljö!

    // I detta exempel omdirigerar vi bara och antar att tokens finns i minnet/sessionen.
    // Vi behöver en mekanism för att faktiskt spara dessa till användaren.
    // För nu, omdirigera till huvudsidan med ett success-meddelande.
    return NextResponse.redirect(new URL('/projects?status=google_auth_success', request.url));

  } catch (error) {
    console.error("Error exchanging Google auth code for tokens: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(new URL(`/?error=google_auth_failed&details=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
