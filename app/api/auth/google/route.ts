import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  // Skapa en OAuth2-klient med de autentiseringsuppgifter som du redan har lagt in i .env
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Definiera de "scopes" (behörigheter) vi begär. Vi vill ha full åtkomst till Drive.
  const scopes = [
    'https://www.googleapis.com/auth/drive'
  ];

  // Generera en URL som användaren kan besöka för att ge sitt samtycke.
  // `access_type: 'offline'` är KRITISKT för att vi ska få en refresh_token.
  // `prompt: 'consent'` tvingar samtyckesdialogen att visas varje gång, vilket är bra under utveckling.
  const authorizationUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' 
  });

  // Omdirigera användaren till den genererade Google-autentiseringssidan.
  return NextResponse.redirect(authorizationUrl);
}
