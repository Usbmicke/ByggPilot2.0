
import { CoreMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { auth } from '@/auth';
import { getChatMessages, addMessageToChat, createChat } from '@/lib/data-access';
import { masterPrompt } from '@/lib/prompts/master-prompt';
import { tools } from '@/lib/tools';
import { StreamingTextResponse } from 'ai';

// =================================================================================
// CHAT-ORKESTRERARE (v1.1 - Korrekt Header)
//
// Beskrivning: Korrigerar API-svaret till att använda den AI SDK-kompatibla
//              `X-Vercel-AI-Data`-headern. Detta låser upp frontend och tillåter
//              konversationen att fortsätta.
// =================================================================================

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    const { messages, chatId: existingChatId } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content;

    if (!lastUserMessage) {
        return new Response('Bad Request: No user message found.', { status: 400 });
    }

    const history = existingChatId ? await getChatMessages(existingChatId) : [];
    const historyAsCoreMessages: CoreMessage[] = history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const chatId = existingChatId ?? await createChat(userId, lastUserMessage);
    
    await addMessageToChat(chatId, { role: 'user', content: lastUserMessage });

    const result = await streamText({
      model: openai.chat('gpt-4-turbo'),
      system: masterPrompt,
      messages: [...historyAsCoreMessages, ...messages],
      tools: tools,
    });

    const stream = result.toAIStream({
      async onFinal(completion) {
        await addMessageToChat(chatId, { role: 'assistant', content: completion });
      },
    });

    // KORREKT IMPLEMENTATION: Skicka med chatId i rätt header och format.
    const customData = { chatId: chatId };
    return new StreamingTextResponse(stream, {
        headers: {
            'X-Vercel-AI-Data': JSON.stringify(customData),
        }
    });

  } catch (error) {
    console.error('[Chat API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}
