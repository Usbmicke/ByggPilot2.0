
import { CoreMessage, streamText, tool, ToolCallContent } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { masterPrompt } from '@/lib/prompts/master-prompt';
import { z } from 'zod';
import { createProject } from '@/lib/dal/projects';
import { logger } from '@/lib/logger'; // KVALITETSREVISION: Importera den strukturerade loggaren

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 30;

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(req: NextRequest) {
    let userId: string;

    try {
        // 1. SÄKERHET: Validera session och rate limit
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            logger.warn('[Chat API] Unauthorized access attempt.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        userId = session.user.id;

        const ip = req.ip ?? '127.0.0.1';
        const { success } = await ratelimit.limit(userId); // Byt till userId för mer rättvis rate limiting
        if (!success) {
            logger.warn(`[Chat API] Rate limit exceeded for user: ${userId}`);
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { messages }: { messages: CoreMessage[] } = await req.json();
        logger.info(`[Chat API] Received request for user: ${userId}`, { numMessages: messages.length });

        // 2. AI-ANROP: Skicka till Vercel AI SDK
        const result = await streamText({
            model: openai('gpt-4o'),
            system: masterPrompt,
            messages: messages,
            tools: {
                startProject: tool({
                    description: 'Starta ett nytt projekt. Används när användaren vill initiera ett nytt projekt eller arbete.',
                    parameters: z.object({
                        projectName: z.string().describe('Ett kort, beskrivande namn för projektet.'),
                        customerName: z.string().describe('Namnet på kunden.'),
                        address: z.string().describe('Adressen för projektet.'),
                    }),
                    // KVALITETSREVISION: Förbättrad felhantering och loggning inuti verktyget
                    execute: async ({ projectName, customerName, address }) => {
                        logger.info(`[AI Tool] Executing startProject for user: ${userId}`, { projectName });
                        try {
                            const toolResult = await createProject(userId, projectName, customerName, address);
                            if (!toolResult.success) {
                                throw new Error(toolResult.message);
                            }
                            // Returnera ett framgångsmeddelande som AI:n kan använda i sitt svar
                            return { success: true, message: `Projektet '${projectName}' har skapats med ID ${toolResult.projectId}.` };
                        } catch (error) {
                            logger.error('[AI Tool Error: startProject]', { userId, projectName, error });
                            // Informera AI-modellen om felet så den kan svara användaren korrekt
                            return { success: false, message: "Kunde inte skapa projektet på grund av ett internt fel." };
                        }
                    }
                })
            }
        });

        // 3. SVAR: Strömma tillbaka svaret till klienten
        return result.toAIStreamResponse();

    } catch (error: unknown) {
        // KVALITETSREVISION: Förbättrad, strukturerad felhantering
        let errorMessage = 'An internal error occurred.';
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        // @ts-ignore - Fånga eventuella specifika AI SDK-fel
        if (error.name === 'AIError') {
            // @ts-ignore
            errorMessage = error.message;
            // @ts-ignore
            statusCode = error.status || 500;
        }

        logger.error('[Chat API Global Error]', { userId: userId! || 'unknown', error });

        return NextResponse.json({ error: errorMessage, details: error }, { status: statusCode });
    }
}
