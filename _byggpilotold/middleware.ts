
// GULDSTANDARD v2025.11: Genkit-Native Middleware
import { NextResponse, type NextRequest } from 'next/server';

// Denna middleware kommer att ersättas med den officiella Genkit Auth-middlewaren
// så snart den är tillgänglig och konfigurerad.
// För nu, är den en enkel pass-through.

export async function middleware(req: NextRequest) {
  // Framtida logik för att verifiera Genkit-session kommer här.
  console.log(`[Middleware v2025.11] Path: ${req.nextUrl.pathname}`)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*|/api/genkit/:path*)',
  ],
};
