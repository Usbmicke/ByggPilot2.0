
import { NextRequest, NextResponse } from "next/server";
import { streamText, CoreMessage } from "ai";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { google } from "@ai-sdk/google";
import { adminDb } from "@/lib/admin";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import logger from "@/lib/logger";
import fs from 'fs/promises';
import path from 'path';

// =================================================================================
// CHAT API V7.0 - KONVERSATIONELLA FLÖDEN & VERKTYGSANROP (SIMULERAD)
// ARKITEKTUR:
// 1.  **Avancerad System-Prompt:** Använder nu `v12-conversational.txt`, som instruerar
//     modellen att vara tillståndskänslig, ställa följdfrågor, sammanfatta och
//     invänta bekräftelse.
// 2.  **Verktygsanrops-logik:** Innehåller nu logik för att detektera och parsa
//     `[TOOL_CALL]` i AI:ns svar. I denna version loggas anropet endast, men
//     grunden är lagd för att faktiskt exekvera funktioner.
// 3.  **Förbättrad Minneshantering:** Skickar nu med en större del av konversations-
//     historiken (`slice(-10)`) för att ge AI:n bättre kontext för de nya
//     stegvisa flödena.
// =================================================================================

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(15, "10 s"), // Ökat limit något
    analytics: true,
});

async function getSystemPrompt() {
    // Byt till den nya, avancerade prompten
    const promptFilePath = path.join(process.cwd(), 'lib', 'prompts', 'v12-conversational.txt');
    try {
        const prompt = await fs.readFile(promptFilePath, 'utf-8');
        return prompt;
    } catch (error) {
        logger.error({ error }, "Kunde inte läsa system-prompt filen v12. Använder en fallback.");
        return "Du är en hjälpsam assistent.";
    }
}

// Funktion för att hantera simulerade verktygsanrop
async function handleToolCall(toolCall: string, userId: string, chatId: string) {
    // Exempel: [TOOL_CALL: CREATE_PROJECT, { "name": "Villa Solbacken", "customer": "Erik Nilsson" }]
    const toolRegex = /^\[TOOL_CALL: (\w+), (\{.*\})\]$/;
    const match = toolCall.match(toolRegex);

    if (!match) {
        logger.warn({ toolCall }, "Mottog ett ogiltigt formaterat verktygsanrop.");
        return; // Inte ett giltigt anrop
    }

    const [, toolName, paramsJson] = match;
    const params = JSON.parse(paramsJson);

    logger.info({ toolName, params, userId, chatId }, `Verktygsanrop mottaget och parsat.`);

    // ** FRAMTIDA IMPLEMENTATION **
    // switch (toolName) {
    //     case 'CREATE_PROJECT':
    //         await createProjectInFirestore(params, userId);
    //         // Skicka ett bekräftelsemeddelande tillbaka till chatten via en annan mekanism
    //         break;
    //     // Fler cases för andra verktyg
    // }
    
    // För nu, logga bara anropet. I nästa steg kommer vi agera på det.
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
        const userId = session.user.id;

        const latestMessage = messages[messages.length - 1];
        const userMessageRef = adminDb.collection("users").doc(userId).collection("chats").doc(chatId).collection("messages");

        // Spara användarens meddelande, men bara om det inte är tomt
        if (latestMessage?.content) {
            await userMessageRef.add({ role: 'user', content: latestMessage.content, createdAt: new Date() });
        }

        const systemPromptContent = await getSystemPrompt();
        const systemPrompt: CoreMessage = { role: "system", content: systemPromptContent };
        
        const finalMessages: CoreMessage[] = [ systemPrompt, ...messages.slice(-10) ];

        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            messages: finalMessages,
        });

        // Specialhantering för att fånga upp verktygsanrop
        const { textStream, a, b, c } = result.tee();

        (async () => {
            const fullResponse = await c.readToEnd();
            if (fullResponse.startsWith('[TOOL_CALL:')) {
                await handleToolCall(fullResponse, userId, chatId!);
            }
        })();

        const stream = result.toAIStream({
            onCompletion: async (completion: string) => {
                // Spara assistentens svar, men INTE om det var ett verktygsanrop
                if (!completion.startsWith('[TOOL_CALL:')) {
                    await userMessageRef.add({
                        role: 'assistant',
                        content: completion,
                        createdAt: new Date(),
                    });
                }
            },
        });

        return new Response(stream);

    } catch (error: any) {
        logger.error(
            { error: error.message, chatId: chatId, userIp: ip, stack: error.stack },
            "Ett fel uppstod i chatt-API:et."
        );

        return NextResponse.json(
            { error: "Något gick fel i chatt-API:et. Vänligen försök igen." },
            { status: 500 }
        );
    }
}
