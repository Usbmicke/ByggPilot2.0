
import { NextRequest, NextResponse } from 'next/server';

// GULDSTANDARD v2025.11: Enhetlig Genkit Pass-through Proxy
// Denna fil är den enda kommunikationskanalen mellan frontend och backend.
// Den säkerställer att alla anrop, inklusive headers och body, skickas
// vidare till Genkit-servern på ett säkert och förutsägbart sätt.

const GENKIT_API_HOST = 'http://127.0.0.1:3400'; // Porten som definieras i AI_INSTRUCTIONS.md

async function handler(req: NextRequest) {
  const { pathname, search } = new URL(req.url);
  
  // Bygg om URL:en för att peka mot Genkit-servern.
  // Tar bort /api från sökvägen för att matcha Genkits förväntade format.
  const destinationPath = pathname.replace('/api', '');
  const destinationUrl = `${GENKIT_API_HOST}${destinationPath}${search}`;

  // Skapa en ny request för att skicka vidare.
  // Kopiera över metod, headers och body från den ursprungliga requesten.
  const forwardedRequest = new Request(destinationUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    // @ts-ignore
    duplex: 'half',
  });

  try {
    const response = await fetch(forwardedRequest);
    
    // Skapa och returnera ett nytt NextResponse-objekt baserat på
    // svaret från Genkit-servern. Detta bevarar statuskoder,
    // headers och body (inklusive streaming).
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error(`[GENKIT PROXY ERROR]:`, error);
    return NextResponse.json(
      { error: 'Proxy-fel vid anslutning till Genkit-servern.' },
      { status: 502 } // 502 Bad Gateway
    );
  }
}

// Exportera samma handler för alla relevanta HTTP-metoder.
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;
