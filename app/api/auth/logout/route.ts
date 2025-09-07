
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

export async function GET(request: Request) {
  try {
    // Hämta den aktuella sessionen
    const session = await getSession();

    // Förstör sessionen, vilket tar bort cookien från webbläsaren
    session.destroy();

    // Omdirigera användaren till startsidan efter utloggning
    // Vi lägger till en parameter för att kunna visa ett bekräftelsemeddelande
    const redirectUrl = new URL('/?status=logged_out', request.url);
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Error during logout: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
