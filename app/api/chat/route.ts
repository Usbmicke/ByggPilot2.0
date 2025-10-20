
import { NextResponse } from "next/server";
import { CoreMessage, streamText, tool, ToolCallPart, experimental_StreamData, StreamingTextResponse } from "ai";
import { google } from "@ai-sdk/google";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import * as dal from '@/lib/data-access';
import { tools } from '@/lib/tools';
import logger from "@/lib/logger";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

const ChatRequestSchema = z.object({
    chatId: z.string().nullable(),
    messages: z.array(z.any()),
});

/**
 * Laddar dynamiskt Guldstandard-systemprompten från filsystemet.
 * Detta säkerställer att AI:n alltid har de senaste instruktionerna.
 */
async function getSystemPrompt(): Promise<CoreMessage> {
    const promptPath = path.join(process.cwd(), 'lib', 'prompts', 'v13-tools.txt');
    try {
        const promptContent = await fs.readFile(promptPath, 'utf-8');
        logger.info("System prompt v13-tools.txt loaded successfully.");
        return {
            role: 'system',
            content: promptContent,
        };
    } catch (error) {
        logger.error({ error }, "CRITICAL: Failed to read system prompt file v13-tools.txt. Falling back to default.");
        return {
            role: 'system',
            content: 'Du är ByggPilot Co-Pilot, en expertassistent. Varning: Huvudsystemprompten kunde inte laddas, funktionaliteten är begränsad.'
        };
    }
}

export async function POST(req: Request) {
    const traceId = uuidv4();
    const requestLogger = logger.child({ traceId });
    const data = new experimental_StreamData();

    try {
        // Sessionen valideras nu helt inom DAL, men vi gör en initial kontroll här.
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rawBody = await req.json();
        const validationResult = ChatRequestSchema.safeParse(rawBody);
        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error.flatten() }, { status: 400 });
        }
        let { chatId, messages } = validationResult.data;
        let isNewChat = !chatId;

        if (isNewChat) {
            const firstUserMessage = messages.find(m => m.role === 'user');
            if (firstUserMessage) {
                // Anropar den nya, säkra DAL-funktionen utan userId
                chatId = await dal.createChat(firstUserMessage);
                requestLogger.info({ newChatId: chatId }, "Ny chatt skapad i DAL.");
                data.append({ chatId: chatId }); // Skicka nya chatId till klienten
            }
        } else {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'user') {
                // Anropar den nya, säkra DAL-funktionen utan userId
                await dal.addMessageToChat(chatId!, lastMessage);
            }
        }

        const systemPrompt = await getSystemPrompt();
        // Anropar den nya, säkra DAL-funktionen utan userId
        const history = chatId ? await dal.getChatMessages(chatId) : messages;
        const allMessages: CoreMessage[] = [systemPrompt, ...history];

        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            messages: allMessages,
            tools,
            onFinish: async ({ text, toolCalls, toolResults }) => {
                 const assistantResponse = {
                    role: 'assistant' as const,
                    content: text || ''
                };
                 if (toolCalls && toolCalls.length > 0) {
                    (assistantResponse.content as any) = toolCalls;
                }
                
                requestLogger.info({ chatId }, "Stream avslutad, sparar assistentens svar.");
                // Anropar den nya, säkra DAL-funktionen utan userId
                if (chatId) {
                    await dal.addMessageToChat(chatId, assistantResponse);
                }
                data.close();
            },
        });
        
        return new StreamingTextResponse(result.toAIStream(), {}, data);

    } catch (error: any) {
        requestLogger.error({ error: error.message, stack: error.stack }, "Kritiskt fel i chatt-API:et.");
        data.close();
        // Om felet kommer från DAL:s session-verifiering, sätt rätt status.
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return NextResponse.json(
            { error: "Ett internt serverfel uppstod." },
            { status }
        );
    }
}
