
import { NextRequest, NextResponse } from 'next/server';
import { callGenkitFlow } from '@/lib/genkit'; // Importera vår Genkit-anropare

// Importera ReadableStream för att kunna strömma svaret
const { ReadableStream } = require('stream/web');

// Detta är den primära slutpunkten för chattfunktionaliteten.
// Den drivs nu av ett dedikerat Genkit-flöde.
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Säkerställ att det finns meddelanden att behandla
    if (!messages || messages.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Inga meddelanden i förfrågan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Anropa det nya Genkit-flödet för chatt och skicka med hela meddelandehistoriken
    const stream = await callGenkitFlow('chatWithByggpilotFlow', { messages });

    // Returnera en strömmande respons direkt från Genkit
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Fel i /api/chat:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
