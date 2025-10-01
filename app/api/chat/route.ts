
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { StreamingTextResponse, streamText, type CoreMessage } from 'ai';
import { NextRequest } from 'next/server';

// REPARATION: Tvingar AI-biblioteket att använda den stabila v1-versionen av API:et,
// istället för den föråldrade v1beta-versionen.
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1', // Tvinga användning av den korrekta API-versionen.
});

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const result = await streamText({
      // Använder nu en modern och kapabel modell, vilket är möjligt tack vare rätt API-version.
      model: google('gemini-1.5-flash-latest'),
      messages: messages,
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    });

    return new StreamingTextResponse(result.stream);

  } catch (error) {
    console.error("Ett fel uppstod i /api/chat:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Ett internt serverfel uppstod. Vänligen försök igen senare.',
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
