
'use client';

import { useChat, type UseChatResult } from '@ai-sdk/react';
import type { CoreMessage } from 'ai';
import { useEffect } from 'react';

// =================================================================================
// use-chat HOOK (v1.8 - Grundläggande Korrigering)
//
// Beskrivning: Åtgärdar det fundamentala felet. Istället för att dekonstruera
//              och rekonstruera retur-objektet (vilket bryter den interna
//              bindningen i `useChat`), returnerar vi nu det ursprungliga objektet
//              direkt. Detta är den korrekta metoden för att skapa en wrapper-hook.
// =================================================================================

interface UseChatLogicOptions {
  initialMessages?: CoreMessage[];
  onNewChat?: (chatId: string) => void;
}

export const useChatLogic = (chatId: string | null, options: UseChatLogicOptions = {}): UseChatResult => {
  // 1. Hämta HELA resultatobjektet från den ursprungliga hooken
  const chatApi = useChat({
    id: chatId ?? undefined,
    initialMessages: options.initialMessages,
    api: '/api/chat',
    body: {
      chatId: chatId,
    },
  });

  // useEffect kan fortfarande användas för att lägga till sidoeffekter.
  // Denna logik är korrekt och påverkar inte inmatningen.
  useEffect(() => {
    if (chatApi.data && options.onNewChat) {
      const newChatId = (chatApi.data as any).chatId;
      if (newChatId && newChatId !== chatId) {
          options.onNewChat(newChatId);
      }
    }
  }, [chatApi.data, chatId, options.onNewChat]);

  // 2. Returnera HELA det ursprungliga, oförändrade objektet.
  return chatApi;
};
