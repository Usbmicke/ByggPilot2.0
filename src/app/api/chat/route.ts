
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { masterPrompt } from '@/lib/prompts/master-prompt';
import { aiTools } from '@/lib/tools';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

// FIX: Tar bort 'edge' runtime. Den är inkompatibel med nödvändiga server-bibliotek (som Firebase/Auth).
// Detta var grundorsaken till att "Skicka"-anropet kraschade tyst på servern.
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const ratelimit = kv
  ? new Ratelimit({
      redis: kv,
      // Begränsar till 50 meddelanden per dag per användare.
      limiter: Ratelimit.slidingWindow(50, '1 d'), 
    })
  : null;

export async function POST(req: NextRequest) {
    try {
        // KORRIGERING: Använder Edge-kompatibla 'getToken' för säker autentisering.
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        // Validerar att token finns och innehåller användar-ID ('sub').
        if (!token?.sub) {
            return new Response('Unauthorized', { status: 401 });
        }
        const userId = token.sub;

        // Implementerar Rate Limiting enligt 'viktigt.md'.
        if (ratelimit) {
            const { success } = await ratelimit.limit(userId);
            if (!success) {
                logger.warn(`[API:Chat] Rate limit har överskridits för användare: ${userId}`);
                return new Response('Rate limit överskriden', { status: 429 });
            }
        }

        const { messages } = await req.json();

        // Anropar AI-modellen med Vercel AI SDK, nu i rätt miljö.
        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            system: masterPrompt,
            tools: aiTools,
            messages: messages,
        });
        
        return result.toAIStreamResponse();

    } catch (error) {
        logger.error({ message: '[API:Chat] Ett oväntat fel inträffade', error });

        return new Response('Ett oväntat fel inträffade. Försök igen senare.', { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
