
import { NextRequest, NextResponse } from "next/server";
import { Message, streamText, CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { getPineconeClient } from "@/lib/pinecone";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/admin";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import logger from "@/lib/logger"; // Importera den nya loggern

// =================================================================================
// CHAT API V4.0 - ROBUST LOGGNING
// ARKITEKTUR: Ersätter console.error med den nya strukturerade loggern.
// Varje fel loggas nu som ett sökbart JSON-objekt med kontext.
// =================================================================================

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
});

export async function POST(req: NextRequest) {
    const ip = req.ip ?? "127.0.0.1";
    let chatId: string | null = null; // Deklarera chatId här för att ha den i catch-blocket

    try {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return NextResponse.json({ error: "Too many requests." }, { status: 429 });
        }

        const { messages, chatId: reqChatId }: { messages: CoreMessage[]; chatId: string } = await req.json();
        chatId = reqChatId; // Sätt chatId värdet
        const user = await auth();

        if (!user?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const latestMessage = messages[messages.length - 1].content as string;

        const { embedding } = await embed({
            model: google("models/text-embedding-004"),
            value: latestMessage,
        });

        const pineconeClient = await getPineconeClient();
        const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME!);

        const queryResult = await pineconeIndex.query({
            vector: embedding,
            topK: 10,
            includeMetadata: true,
        });

        const context = queryResult.matches
            .map((match) => (match.metadata as { text: string }).text)
            .join("\n\n---\n\n");

        const systemPrompt: CoreMessage = {
            role: "system",
            content: `Du är en expert-assistent... (samma som V2.0)`,
        };
        
        const finalMessages: CoreMessage[] = [
            systemPrompt,
            ...messages.slice(-2),
        ];

        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            messages: finalMessages,
        });

        const stream = result.toAIStream({
            onCompletion: async (completion: string) => {
                const userMessageRef = adminDb.collection("users").doc(user.user.id!).collection("chats").doc(chatId!).collection("messages");
                await userMessageRef.add({
                    role: "user",
                    content: latestMessage,
                    createdAt: new Date(),
                });
                await userMessageRef.add({
                    role: "assistant",
                    content: completion,
                    createdAt: new Date(),
                });
            },
        });

        return new Response(stream);

    } catch (error: any) {
        // Använd den nya, strukturerade loggern
        logger.error(
            { 
                error: error.message, 
                chatId: chatId, // Inkludera viktig kontext
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
