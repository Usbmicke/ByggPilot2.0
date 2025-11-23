
import { NextResponse, type NextRequest } from 'next/server';
import { initGenkit } from '@/app/_lib/genkit';
import { run } from '@genkit-ai/flow';
import { verifySession } from '@/app/_lib/dal/dal';
import { aibrain } from '@/app/_lib/genkit/brains';

// GULDSTANDARD v5.0: Initiera Genkit en gång när servern startar.
initGenkit();

/**
 * API-route för ByggPilot AI-chatten.
 * Denna route följer 'Det Heliga Flödet' för säkerhet och dataåtkomst.
 */
export async function POST(request: NextRequest) {
  console.log("[API /chat] Mottog POST-anrop");

  try {
    // 1. Verifiera sessionen: Säkerställer att användaren är inloggad.
    const session = await verifySession(request.cookies.get('__session')?.value);
    console.log(`[API /chat] Session verifierad för userId: ${session.userId}`);

    // 2. Extrahera meddelanden från request body
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: ''Meddelanden' är i fel format.' }, { status: 400 });
    }

    // 3. Kör Genkit-flödet (AI-hjärnan) med användarens meddelanden
    // Flödet tar emot hela historiken för att kunna ha kontext.
    const result = await run(aibrain, { messages });
    
    // 4. Returnera AI-assistentens svar
    return NextResponse.json({ reply: result.reply }, { status: 200 });

  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      console.error("[API /chat] Obehörig åtkomst:", error.message);
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    console.error(`[API /chat] Internt serverfel: ${error.message}`, error);
    return NextResponse.json({ error: 'Ett fel uppstod i AI-assistenten.', details: error.message }, { status: 500 });
  }
}
