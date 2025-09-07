
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

/**
 * Denna API-slutpunkt är avsedd att anropas från klientsidan (webbläsaren)
 * för att på ett säkert sätt kontrollera den aktuella autentiseringsstatusen.
 */
export async function GET() {
  try {
    const session = await getSession();
    const { userId, isLoggedIn } = session;

    if (isLoggedIn && userId) {
      // Om sessionen är giltig och innehåller ett användar-ID,
      // returnera en bekräftelse.
      return NextResponse.json({ isLoggedIn: true, userId });
    } else {
      // Annars, ange att användaren inte är inloggad.
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error("Error fetching session status: ", error);
    // Vid eventuella fel, anta att användaren inte är inloggad för säkerhets skull.
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error'}), { status: 500 });
  }
}
