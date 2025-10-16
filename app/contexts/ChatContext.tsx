'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCompletion, type UseCompletionOptions } from 'ai/react';
import { API_CHAT } from '@/app/constants/apiRoutes';

// Defines the shape of a single chat message
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Defines the shape of the context value
interface ChatContextType {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  append: (content: string) => void;
  setInput: (value: string) => void; // <-- TILLAGD
}

// Creates the context with an initial value of undefined
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// =================================================================================
// CHAT CONTEXT V13.0 - ADDED SETINPUT FOR QUICK ACTIONS
// REVISION:
// 1.  Added `setInput` to the context type and value. This function is provided
//     by the `useCompletion` hook and allows us to programmatically set the
//     chat input's content. This is the foundation for creating quick action buttons.
// =================================================================================

export function ChatProvider({ children }: { children: ReactNode }) {
  const initialAssistantMessage: Message = {
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
    append: vercelAppend, // Rename to avoid conflict
    setInput, // <-- TILLAGD
  } = useCompletion({
    api: API_CHAT,
    // @ts-ignore
    initialMessages: [initialAssistantMessage],
  });

  // Custom append function if needed for other interactions
  const append = (content: string) => {
     // @ts-ignore
     vercelAppend({ role: 'user', content });
  }

  const contextValue: ChatContextType = {
    // @ts-ignore
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    setInput, // <-- TILLAGD
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to easily use the ChatContext
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
