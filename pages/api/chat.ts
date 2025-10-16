// File: pages/api/chat.ts

import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

// =================================================================================
// API CHAT ENDPOINT V1.0 - NYSKAPAD
// SYFTE: Denna fil var helt frånvarande. Den skapar den nödvändiga /api/chat
// endpoint som frontend anropar. Den tar emot meddelandehistoriken, lägger till
// en system-prompt, och strömmar sedan tillbaka svaret från OpenAI.
// Inkluderar även rate limiting för att förhindra missbruk.
// =================================================================================

// Konfigurera OpenAI API
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge';

export default async function POST(req: Request) {
  // Rate Limiting med Vercel KV och Upstash Ratelimit
  if (process.env.VERCEL_ENV === 'production') {
      const ip = req.headers.get('x-forwarded-for');
      const ratelimit = new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(5, '10s') });
      const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
      
      if (!success) {
          return new Response('You have reached your request limit.', { status: 429 });
      }
  }

  try {
    const { messages } = await req.json();

    // Lägg till en system-prompt för att guida AI:n
    const systemPrompt = {
      role: 'system',
      content: `Du är ByggPilot Co-Pilot, en hjälpsam AI-assistent specialiserad på den svenska byggbranschen. Ditt mål är att hjälpa användare med administrativa uppgifter, svara på branschspecifika frågor och agera som en digital kollega. Svara alltid på svenska, var professionell och koncis.`
    };

    // Skapa svaret med Vercel AI SDK
    const response = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: [systemPrompt, ...messages],
    });

    // Konvertera svaret till en vänlig textström
    const stream = OpenAIStream(response);

    // Svara med strömmen
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("[API CHAT ERROR]", error);
    return new Response('Något gick fel med din förfrågan.', { status: 500 });
  }
}
