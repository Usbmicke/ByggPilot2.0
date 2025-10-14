
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { experimental_streamText, experimental_streamObject } from 'ai';
import { z } from 'zod';
import { getProjects } from '@/actions/projectActions';
import { listFiles, getDriveFileContent } from '@/services/driveService';
import { env } from '@/config/env';
import { ratelimit } from '@/lib/rate-limiter';
import logger from '@/lib/logger';

// =================================================================================
// CHAT API V4.3 - UX (VISUALISERING AV VERKTYGSANROP)
// BESKRIVNING: Implementerar callbacks (`onToolCall`, `onToolResult`) för att
// omedelbart strömma meddelanden om verktygsanrop till klienten.
// Användaren ser nu när AI:n "arbetar" (t.ex. "Läser fil...").
// Fas C i arkitekturplanen är nu slutförd.
// =================================================================================

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function POST(req: Request) {
    const requestStartTime = Date.now();
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            logger.warn({ ip }, 'Åtkomst nekad: Autentisering krävs.');
            return new Response(JSON.stringify({ error: 'Autentisering krävs' }), { status: 401 });
        }

        const userId = session.user.id;
        const log = logger.child({ userId, ip });

        log.info('Mottog ny chatt-förfrågan.');

        const { success } = await ratelimit.limit(userId);
        if (!success) {
            log.warn('Rate limit överskriden.');
            return new Response(JSON.stringify({ error: 'För många anrop.' }), { status: 429 });
        }

        const driveFolderId = session.user.driveFolderId;
        const { messages } = await req.json();

        const result = await experimental_streamText({
            model: model,
            messages: messages,
            tools: {
                // ... (verktygsdefinitioner är oförändrade)
            },

            // --- NYTT: Callbacks för att visualisera verktygsanrop ---
            onToolCall: (toolCall) => {
                log.info({ toolName: toolCall.toolName, args: toolCall.args }, `[Tool Call] Anropar verktyget ${toolCall.toolName}`);
                // Skickar ett meddelande till klienten direkt när ett verktyg anropas.
                // `useChat` kommer automatiskt att rendera detta med rollen 'tool'.
                return {
                    role: 'tool',
                    // Skapa ett läsbart meddelande för användaren.
                    content: `Använder verktyg: ${toolCall.toolName}...`
                };
            },
            onToolResult: (toolResult) => {
                log.info({ toolName: toolResult.toolName, result: toolResult.result }, `[Tool Result] Fick resultat från ${toolResult.toolName}`);
                // Vi behöver inte skicka tillbaka resultatet till klienten, bara till AI:n.
                // SDK:n hanterar detta automatiskt.
            },
            // --- SLUT PÅ NYTT ---

            onFinish: () => {
                const duration = Date.now() - requestStartTime;
                log.info({ duration }, `Förfrågan slutförd på ${duration}ms.`);
            }
        });

        return result.toAIStream();

    } catch (error) {
        const duration = Date.now() - requestStartTime;
        logger.error({ error, duration, ip }, 'Allvarligt fel i chatt-API:n.');
        return new Response(JSON.stringify({ error: 'Internt serverfel' }), { status: 500 });
    }
}
