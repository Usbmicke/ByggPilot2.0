
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { masterPrompt } from '@/lib/prompts/master-prompt';
import { aiTools } from '@/lib/tools';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { logger } from '@/lib/logger';

// KORRIGERING: Tar bort 'edge' runtime för att tillåta server-tung autentisering.
// export const runtime = 'edge'; 
// export const maxDuration = 30;

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const ratelimit = kv
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, '1 d'),
    })
  : null;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const userId = session.user.id;

        if (ratelimit) {
            const { success } = await ratelimit.limit(userId);
            if (!success) {
                logger.warn(`[API:Chat] Rate limit exceeded for user: ${userId}`);
                return new Response('Rate limit exceeded', { status: 429 });
            }
        }

        const { messages } = await req.json();

        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            system: masterPrompt,
            tools: aiTools,
            messages: messages,
        });
        
        return result.toAIStreamResponse();

    } catch (error) {
        logger.error({ message: '[API:Chat] An unexpected error occurred', error });

        return new Response('An unexpected error occurred. Please try again later.', { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
