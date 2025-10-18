'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { useChat, type CoreMessage } from '@ai-sdk/react'; // KORRIGERAD IMPORT
import { API_CHAT } from '@/app/constants/apiRoutes';
import { v4 as uuidv4 } from 'uuid'; // För att skapa unika ID:n

// Defines the shape of the context value
interface ChatContextType {
  messages: CoreMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  setInput: (value: string) => void;
  chatId: string; // Exponera chatId för att skicka med i API-anrop
}

// Creates the context with an initial value of undefined
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// =================================================================================
// CHAT CONTEXT V14.0 - SDK V3 MIGRATION & STABILITET
// REVISION:
// 1.  **SDK v3:** Bytt från `useCompletion` (från `ai/react`) till `useChat` (från `@ai-sdk/react`).
//     Detta är den största förändringen och löser grundorsaken till många buggar.
// 2.  **Unikt Chat ID:** Ett unikt `chatId` genereras nu för varje ny chatt-session.
//     Detta ID skickas med i varje anrop till backend, vilket möjliggör robust
//     spårning och tillståndshantering på servern.
// 3.  **`initialInput`:** `useChat` anropas nu med `initialInput: ''`. Detta
//     garanterar att `input` aldrig är `undefined`, vilket löser .trim()-kraschen
//     och problem med skrivskyddade fält.
// 4.  **Typ-säkerhet:** Använder nu `CoreMessage` från `@ai-sdk/react` för meddelanden.
// =================================================================================

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatId] = useState(uuidv4()); // Generera ett unikt ID för denna chatt-session

  const initialAssistantMessage: CoreMessage = {
    id: `asst-${Date.now()}`,
    role: 'assistant',
    content: 'Hej! Jag är ByggPilot Co-Pilot. Hur kan jag hjälpa dig idag? Du kan be mig skapa ett nytt projekt, lägga till en kund eller något annat.'
  };

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    setInput,
  } = useChat({
    api: API_CHAT,
    id: chatId, // Skicka med vårt unika ID
    initialMessages: [initialAssistantMessage],
    initialInput: '', // <-- KRITISK FIX: Garanterar att input aldrig är undefined
    body: { // Skicka med chatId i kroppen av varje request
      chatId: chatId,
    },
  });

  const contextValue: ChatContextType = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    chatId,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to easily use the ChatContext
export function useChatContext() { // Omdöpt för att undvika konflikt
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
