
import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, CoreMessage } from 'ai';
import { getContext } from '@/services/aiService';
import { getSystemPrompt } from '@/ai/prompts';
import { auth } from '@/../auth'; // Korrekt sökväg till den nya auth.ts

// Definiera modellen som ska användas
const MODEL_ID = "gemini-2.0-flash";

// Initiera Google AI-providern. API-nyckeln hämtas automatiskt från miljövariabeln GOOGLE_API_KEY.
const google = createGoogleGenerativeAI();

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth(); // Anropar nu den korrekta funktionen
    // Vercel AI SDK v3 hanterar meddelandehistoriken direkt i CoreMessage-format.
    const { messages, data }: { messages: CoreMessage[], data: any } = await req.json();

    // 1. Hämta den senaste användarmeddelandet för kontext-analys
    const lastUserMessage = messages[messages.length - 1]?.content;
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'Inget meddelande att behandla.' }, { status: 400 });
    }

    // 2. Bygg den utökade kontexten baserat på användarens fråga och eventuell extra data
    const context = await getContext(String(lastUserMessage), data);

    // 3. Konstruera system-prompten med den dynamiska kontexten
    const systemPrompt = getSystemPrompt(session?.user?.name, context);

    // 4. Anropa AI-modellen med den nya, strömlinjeformade metoden
    const result = await streamText({
      model: google(MODEL_ID),          // Välj den specifika modellen via providern
      system: systemPrompt,             // Skicka med system-prompten
      messages: messages,               // Skicka med hela meddelandehistoriken
    });

    // 5. Konvertera resultatet till ett strömmande svar och returnera det
    return result.toAIStreamResponse();

  } catch (error) {
    console.error(`[Chat API Error - Model: ${MODEL_ID}]`, error);
    // Returnera ett mer detaljerat felmeddelande vid problem
    return NextResponse.json(
      {
        error: `Ett internt fel uppstod i chat-API:et.`,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
