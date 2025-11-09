
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { masterPrompt } from '@/lib/prompts/master-prompt';
import { aiTools } from '@/lib/tools';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

// FIX: Säkerställer att 'edge' runtime är borttagen. Den är inkompatibel med 
// server-bibliotek som next-auth, vilket var grundorsaken till att 
// "Skicka"-anropet kraschade tyst på servern.
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
        // Använder Edge-kompatibla 'getToken' för säker autentisering.
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        // Validerar att token finns och innehåller användar-ID ('sub').
        if (!token?.sub) {
            logger.warn('[API:Chat] Obehörigt anrop utan giltig token.');
            return new Response('Unauthorized', { status: 401 });
        }
        const userId = token.sub;

        // Implementerar Rate Limiting.
        if (ratelimit) {
            const { success } = await ratelimit.limit(userId);
            if (!success) {
                logger.warn(`[API:Chat] Rate limit har överskridits för användare: ${userId}`);
                return new Response('Rate limit överskriden', { status: 429 });
            }
        }

        const { messages } = await req.json();

        // Anropar AI-modellen med Vercel AI SDK i en standard server-miljö.
        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            system: masterPrompt,
            tools: aiTools,
            messages: messages,
        });
        
        return result.toAIStreamResponse();

    } catch (error) {
        // Förbättrad fel-loggning för att fånga alla typer av fel.
        const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
        logger.error('[API:Chat] Ett oväntat fel inträffade', { error: errorMessage, stack: (error as Error).stack });

        return new Response('Ett oväntat fel inträffade. Försök igen senare.', { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
