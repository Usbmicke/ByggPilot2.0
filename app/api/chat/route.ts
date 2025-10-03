import { NextRequest, NextResponse } from 'next/server';
import { Message, streamToResponse } from 'ai';
import { initialzeFirebaseAdmin } from '@/app/lib/firebase-admin-config';
import { getVertexAI } from 'firebase-admin/vertex-ai';
import { SYSTEM_PROMPT } from '@/app/ai/prompts';

// Denna API-rutt körs på servern (Node.js), INTE i Edge-miljön.

const transformMessage = (message: Message) => ({
  role: message.role === 'assistant' ? 'model' : message.role,
  parts: [{ text: message.content }],
});

export async function POST(req: NextRequest) {
  try {
    // Säkerställ att Firebase Admin är initialiserat
    initialzeFirebaseAdmin();

    const { messages } = await req.json();

    const history = messages.slice(0, -1).map(transformMessage);
    const lastUserMessage = transformMessage(messages[messages.length - 1]);

    // Hämta Vertex AI via den KORREKTA, firebase-admin-metoden.
    const vertexAI = getVertexAI();

    // Använd den stabila 'gemini-pro'-modellen
    const model = vertexAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: history,
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    const result = await chat.sendMessageStream(lastUserMessage.parts);

    // Konvertera Vertex-strömmen till ett AI SDK-kompatibelt svar
    const stream = streamToResponse(result.stream, (chunk) => {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('[FIREBASE_VERTEX_API_ERROR]', error);
    // Skicka ett mer informativt felmeddelande till klienten
    return new NextResponse(JSON.stringify({ error: `Server-side Vertex AI error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
