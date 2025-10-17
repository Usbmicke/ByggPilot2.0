
import { NextRequest, NextResponse } from "next/server";
import { CoreMessage } from "ai";
import { streamText } from "@ai-sdk/core"; // KORRIGERAD IMPORT
import { google } from "@ai-sdk/google";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from "@/lib/admin";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import logger from "@/lib/logger";
import fs from 'fs/promises';
import path from 'path';
import { toolDefinition } from "@/lib/tools";

// =================================================================================
// CHAT API V8.1 - FÖRBÄTTRAD LOGGNING & SPÅRBARHET
// FÖRÄNDRINGAR:
// 1.  **Trace ID:** `chatId` används nu som ett `traceId` i alla loggar för en
//     specifik request. Detta gör det möjligt att spåra en hel konversationstur
//     genom systemet, från inkommande anrop till verktygsexekvering.
// =================================================================================

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, "15 s"),
});

async function getSystemPrompt() {
    const promptFilePath = path.join(process.cwd(), 'lib', 'prompts', 'v13-tools.txt');
    try {
        return await fs.readFile(promptFilePath, 'utf-8');
    } catch (error) {
        logger.error({ error }, "Kunde inte läsa v13-tools.txt. Använder fallback-prompt.");
        return "Du är en hjälpsam assistent.";
    }
}

export async function POST(req: NextRequest) {
    const ip = req.ip ?? "127.0.0.1";
    let chatId: string | null = null; // Definieras här för att vara tillgänglig i yttre catch

    try {
        const { messages, chatId: reqChatId }: { messages: CoreMessage[]; chatId: string } = await req.json();
        chatId = reqChatId; // Sätt chatId för spårning

        const requestLogger = logger.child({ traceId: chatId }); // Skapa en under-logger med traceId

        requestLogger.info("Inkommande chatt-request mottagen.");

        const { success } = await ratelimit.limit(ip);
        if (!success) {
            requestLogger.warn({ ip }, "Rate limit överskriden.");
            return NextResponse.json({ error: "Too many requests." }, { status: 429 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            requestLogger.error("Obehörig request - ingen session hittades.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        const chatRef = adminDb.collection("users").doc(userId).collection("chats").doc(chatId).collection("messages");

        const userMessage = messages[messages.length - 1];
        if (userMessage?.content) {
            await chatRef.add({ ...userMessage, createdAt: new Date() });
        }

        const systemPrompt = await getSystemPrompt();
        const allMessages: CoreMessage[] = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            messages: allMessages,
            tools: toolDefinition(chatId), // Skicka med traceId till verktygen
            toolChoice: 'auto',
        });

        const stream = result.toAIStream({
            onFinal: async (completion) => {
                await chatRef.add({
                    role: 'assistant',
                    content: completion,
                    createdAt: new Date(),
                });
                requestLogger.info("Assistentens slutgiltiga svar sparat.");
            },
        });

        requestLogger.info("Stream till klienten påbörjad.");
        return new Response(stream);

    } catch (error: any) {
        // Använd den yttre logger-instansen om chatId inte kunde parsas
        const errorLogger = logger.child({ traceId: chatId });
        errorLogger.error(
            { error: error.message, userIp: ip, stack: error.stack },
            "Kritiskt fel i chatt-API:et."
        );
        return NextResponse.json(
            { error: "Ett kritiskt fel uppstod. Vänligen försök igen." },
            { status: 500 }
        );
    }
}
