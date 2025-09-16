import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found.' }, { status: 400 });
  }

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Byt ut den mottagna koden mot access och refresh tokens.
    const { tokens } = await oAuth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;

    if (!refresh_token) {
      console.error('Refresh token saknas! Se till att `access_type: \'offline\'` och `prompt: \'consent\'` används.');
      return NextResponse.json({ error: 'Refresh token was not provided by Google. Please ensure you are consenting to offline access.' }, { status: 500 });
    }

    console.log('Mottagen REFRESH TOKEN:', refresh_token);

    // Hitta sökvägen till .env.local i projektets rot
    const envPath = path.resolve(process.cwd(), '.env.local');

    // VIKTIGT: Lägg till refresh token i .env.local-filen.
    // Detta är en temporär lösning för utvecklingssyften.
    // I en produktionsmiljö bör denna token lagras säkert i en databas kopplad till användaren.
    await fs.appendFile(envPath, `\nGOOGLE_REFRESH_TOKEN="${refresh_token}"\n`);

    console.log('Refresh token har sparats i .env.local');

    // Omdirigera användaren tillbaka till huvudsidan efter att allt är klart.
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error: any) {
    console.error('Fel vid utbyte av token:', error.message);
    return NextResponse.json({ error: 'Failed to exchange authorization code for tokens.' }, { status: 500 });
  }
}
