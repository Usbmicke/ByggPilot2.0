
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { masterPrompt } from '@/lib/prompts/master-prompt';
import { aiTools } from '@/lib/tools';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

// ===================================================================================================
// CHAT API V30.0 - FULL FLÖDESREVISION (BACKEND)
// ===================================================================================================
// Denna version är fullt instrumenterad med loggning för att diagnostisera hela anropskedjan.

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const ratelimit = kv
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, '1 d'), 
    })
  : null;

export async function POST(req: NextRequest) {
    logger.info('[API:Chat] STEG 1/5: Anrop mottaget.');

    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.sub) {
            logger.warn('[API:Chat] STEG 2/5: AVSLAGEN. Obehörigt anrop, ingen giltig token.');
            return new Response('Unauthorized', { status: 401 });
        }
        const userId = token.sub;
        logger.info(`[API:Chat] STEG 2/5: GODKÄND. Anrop autentiserat för användare: ${userId}`);

        // Loggar närvaron av API-nyckeln.
        const apiKeyIsSet = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        logger.info(`[API:Chat] STEG 3/5: API-nyckel är ${apiKeyIsSet ? 'satt' : 'INTE SATT'}.`);
        if (!apiKeyIsSet) {
            // Avslutar tidigt om API-nyckeln saknas för att ge tydligt fel.
            throw new Error("Miljövariabeln GOOGLE_GENERATIVE_AI_API_KEY är inte satt på servern.");
        }

        if (ratelimit) {
            const { success } = await ratelimit.limit(userId);
            if (!success) {
                logger.warn(`[API:Chat] Rate limit har överskridits för användare: ${userId}`);
                return new Response('Rate limit överskriden', { status: 429 });
            }
        }

        const { messages } = await req.json();
        logger.info('[API:Chat] STEG 4/5: Påbörjar anrop till AI-modell med följande meddelanden:', { messages });

        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            system: masterPrompt,
            tools: aiTools,
            messages: messages,
        });
        
        logger.info('[API:Chat] STEG 5/5: AI-anrop lyckades, påbörjar streaming av svar.');
        return result.toAIStreamResponse();

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
        const errorStack = error instanceof Error ? error.stack : 'Ingen stack trace tillgänglig.';
        logger.error('[API:Chat] KRITISKT FEL under anrop', { 
            message: errorMessage, 
            stack: errorStack,
            errorObject: JSON.stringify(error, null, 2) // Loggar hela felobjektet
        });

        // Returnerar ett mer informativt fel till klienten
        return new Response(JSON.stringify({ error: 'Ett oväntat serverfel inträffade.', details: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
