
import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createStreamableValue, streamUI, generateText } from 'ai/rsc';
import { getContext } from '@/services/aiService'; // Vi behåller denna för framtida bruk
import { getSystemPrompt } from '@/ai/prompts';
import { auth } from '@/auth';
import { z } from 'zod';

// =================================================================================
// GULDSTANDARD V.6.0 - TOOL-ENABLED ARCHITECTURE
// Detta är den slutgiltiga versionen som implementerar "Tool Use".
// Chatten kan nu förstå när den ska anropa server-funktioner och agera på dem.
// Den använder generateText för att hantera komplexa flöden med verktygsanrop.
// =================================================================================

interface ClientMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const google = createGoogleGenerativeAI();
const model = google('gemini-1.5-flash-latest');

// Simulerad funktion för att skapa en offert. I en riktig app skulle denna
// anropa en annan intern API-endpoint (t.ex. /api/projects/create-offer)
async function createOfferPdf(args: { title: string; customerName: string; lineItems: { description: string; quantity: number; price: number }[] }) {
  console.log("ANROPAR VERKTYG: createOfferPdf med argument:", args);
  // I en riktig app:
  // const response = await fetch('/api/projects/create-offer', { method: 'POST', body: JSON.stringify(args) });
  // const { pdfUrl } = await response.json();
  // return { success: true, pdfUrl };

  // Simulerat svar för demonstration
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulera nätverkslatens
  const pdfUrl = `/pdfs/offert-${args.customerName.toLowerCase().replace(/ /g, '-')}-${Date.now()}.pdf`;
  console.log(`SIMULERAT RESULTAT: PDF skapad på ${pdfUrl}`);
  return { success: true, pdfUrl, message: `PDF-offert har skapats för ${args.customerName}.` };
}

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();
    const { messages: clientMessages, data }: { messages: ClientMessage[], data: any } = await req.json();

    const formattedMessages = clientMessages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text,
    }));

    const systemPrompt = getSystemPrompt(session?.user?.name, data?.context || '');

    const result = await generateText({
      model: model,
      system: systemPrompt,
      messages: formattedMessages,
      tools: {
        createOfferPdf: {
          description: 'Används för att skapa en offert i PDF-format. Du måste fråga användaren om all nödvändig information först, som kundnamn, titel och rad-element (beskrivning, antal, pris), innan du anropar verktyget.',
          parameters: z.object({
            customerName: z.string().describe('Kundens fullständiga namn.'),
            title: z.string().describe('En tydlig titel för offerten, t.ex. \'Byte av 2 fönster\'.'),
            lineItems: z.array(z.object({
              description: z.string().describe('Beskrivning av arbetet eller materialet.'),
              quantity: z.number().describe('Antal, t.ex. 2.'),
              price: z.number().describe('Pris per enhet.'),
            })).describe('En lista med alla rader i offerten.'),
          }),
          execute: async (args) => createOfferPdf(args),
        },
      },
    });
    
    // Konvertera resultatet, som nu kan innehålla både text och verktygsanrop,
    // till ett strömmande svar som klienten kan rendera.
    return new Response(result.response, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error(`[Chat API Error - Guldstandard v6.0]`, error);
    return NextResponse.json(
      {
        error: `Ett internt fel uppstod i chat-API:et.`,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
