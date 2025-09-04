
import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/app/services/googleApiService';

// Denna slutpunkt genererar och returnerar den unika URL
// dit användaren ska skickas för att starta OAuth2-flödet.
export async function GET() {
  try {
    const authUrl = getGoogleAuthUrl();
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating Google Auth URL: ", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
