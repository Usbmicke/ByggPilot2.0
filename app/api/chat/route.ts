
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { StreamingTextResponse, streamText, type CoreMessage } from 'ai';
import { NextRequest } from 'next/server';
import { SYSTEM_PROMPT } from '@/app/ai/prompts';

console.log("--- EXECUTING LATEST /api/chat/route.ts ---");

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Corrected to match .env.local
});

export async function POST(req: NextRequest) {
  console.log("--- POST request received in latest route file ---");
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const messagesWithSystemPrompt: CoreMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ];

    const result = await streamText({
      model: google('gemini-1.0-pro'),
      messages: messagesWithSystemPrompt,
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
