
import { NextRequest, NextResponse } from "next/server";
import { streamText, CoreMessage } from "ai";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { google } from "@ai-sdk/google";
import { adminDb } from "@/lib/admin";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import logger from "@/lib/logger";
import fs from 'fs/promises'; // Använd asynkron fil-läsning
import path from 'path';

// =================================================================================
// CHAT API V6.0 - INTELLIGENS & MINNE
// ARKITEKTUR:
// 1.  **Dynamisk Prompt:** Läser nu dynamiskt in system-prompten från 
//     `lib/prompts/v11-main.txt`, vilket gör AI:ns personlighet lätt att 
//     konfigurera.
// 2.  **Permanent Minne:** Sparar användarens och assistentens meddelanden till
//     Firestore EFTER varje lyckad konversationstur. Detta uppfyller kravet
//     för Guldstandardens "Single Source of Truth".
// =================================================================================

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
});

// Hjälpfunktion för att läsa prompt-filen (cache-as för prestanda i produktion)
async function getSystemPrompt() {
    const promptFilePath = path.join(process.cwd(), 'lib', 'prompts', 'v11-main.txt');
    try {
        const prompt = await fs.readFile(promptFilePath, 'utf-8');
        return prompt;
    } catch (error) {
        logger.error({ error }, "Kunde inte läsa system-prompt filen. Använder en fallback.");
        return "Du är en hjälpsam assistent."; // Fallback-prompt
    }
}

export async function POST(req: NextRequest) {
    const ip = req.ip ?? "127.0.0.1";
    let chatId: string | null = null;

    try {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return NextResponse.json({ error: "Too many requests." }, { status: 429 });
        }

        const { messages, chatId: reqChatId }: { messages: CoreMessage[]; chatId: string } = await req.json();
        chatId = reqChatId;
        
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const latestMessage = messages[messages.length - 1];

        // Spara användarens meddelande OMEDELBART
        const userMessageRef = adminDb.collection("users").doc(session.user.id).collection("chats").doc(chatId).collection("messages");
        await userMessageRef.add({
            role: 'user',
            content: latestMessage.content,
            createdAt: new Date(),
        });

        const systemPromptContent = await getSystemPrompt();
        const systemPrompt: CoreMessage = {
            role: "system",
            content: systemPromptContent,
        };
        
        const finalMessages: CoreMessage[] = [
            systemPrompt,
            ...messages.slice(-5), // Skicka med de 5 senaste meddelandena för kontext
        ];

        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            messages: finalMessages,
        });

        const stream = result.toAIStream({
            onCompletion: async (completion: string) => {
                // Spara assistentens fullständiga svar när det är klart
                await userMessageRef.add({
                    role: 'assistant',
                    content: completion,
                    createdAt: new Date(),
                });
            },
        });

        return new Response(stream);

    } catch (error: any) {
        logger.error(
            { 
                error: error.message, 
                chatId: chatId, 
                userIp: ip,
                stack: error.stack,
            },
            "Ett fel uppstod i chatt-API:et."
        );

        return NextResponse.json(
            { error: "Något gick fel i chat-API:et. Vänligen försök igen." },
            { status: 500 }
        );
    }
}
