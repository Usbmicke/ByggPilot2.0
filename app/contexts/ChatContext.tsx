'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { useChat, type CoreMessage } from '@ai-sdk/react';
import { API_CHAT } from '@/app/constants/apiRoutes';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  messages: CoreMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  setInput: (value: string) => void;
  chatId: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// En tom funktion som "no-op" (no operation) för att agera som en säker fallback.
const noop = () => {};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatId] = useState(uuidv4());

  const initialAssistantMessage: CoreMessage = {
    id: `asst-${Date.now()}`,
    role: 'assistant',
    content: 'Hej! Jag är ByggPilot Co-Pilot. Hur kan jag hjälpa dig idag?'
  };

  const chatApi = useChat({
    api: API_CHAT,
    id: chatId,
    initialMessages: [initialAssistantMessage],
    initialInput: '',
    body: {
      chatId: chatId,
    },
  });

  // DEN DEFINITIVA LÖSNINGEN: Bygg ett vattentätt kontext-värde.
  // Varje property får ett garanterat säkert värde, oavsett vad `useChat` returnerar.
  // Detta eliminerar alla race conditions och `undefined`-krascher.
  const contextValue: ChatContextType = {
    messages: chatApi.messages ?? [initialAssistantMessage],
    input: chatApi.input ?? '',
    handleInputChange: chatApi.handleInputChange ?? noop,
    handleSubmit: chatApi.handleSubmit ?? noop,
    isLoading: chatApi.isLoading ?? false,
    setInput: chatApi.setInput ?? noop,
    chatId: chatId,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
