
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


const ChatRequestSchema = z.object({
    chatId: z.string().nullable(),
    messages: z.array(z.any()),
});

async function getSystemPrompt(): Promise<CoreMessage> {
    return {
        role: 'system',
        content: `Du är ByggPilot Co-Pilot, en expertassistent för byggföretag. Använd dina verktyg proaktivt.`
    };
}

export async function POST(req: Request) {
    const traceId = uuidv4();
    const requestLogger = logger.child({ traceId });
    const data = new experimental_StreamData();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

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
                chatId = await dal.createChat(userId, firstUserMessage);
                requestLogger.info({ newChatId: chatId }, "Ny chatt skapad i DAL.");
                data.append({ chatId: chatId }); // Skicka nya chatId till klienten
            }
        } else {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'user') {
                await dal.addMessageToChat(userId, chatId!, lastMessage);
            }
        }

        const systemPrompt = await getSystemPrompt();
        const history = chatId ? await dal.getChatMessages(userId, chatId) : messages;
        const allMessages: CoreMessage[] = [systemPrompt, ...history];

        const result = await streamText({
            model: google("models/gemini-1.5-flash-latest"),
            messages: allMessages,
            tools,
            onFinish: async ({ text }) => {
                requestLogger.info({ chatId }, "Stream avslutad, sparar assistentens svar.");
                await dal.addMessageToChat(userId, chatId!, {
                    role: 'assistant',
                    content: text,
                });
                data.close();
            },
        });
        
        return new StreamingTextResponse(result.toAIStream(), {}, data);

    } catch (error: any) {
        requestLogger.error({ error: error.message, stack: error.stack }, "Kritiskt fel i chatt-API:et.");
        data.close();
        return NextResponse.json(
            { error: "Ett internt serverfel uppstod." },
            { status: 500 }
        );
    }
}
