
'use client';

import React, { createContext, useContext, ReactNode, FormEventHandler } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';
// Importera den korrekta Message-typen!
import { useChat as useAiChat, type UseChatOptions, type Message } from '@ai-sdk/react';
import toast from 'react-hot-toast';

// =================================================================================
// GULDSTANDARD: CHAT CONTEXT v7.0 (BUILD FIX)
// BESKRIVNING: Helt omskriven ChatContextType för att vara en explicit interface.
// Detta förhindrar att TypeScript-kompilatorn hamnar i en minneskrävande loop
// när den försöker räkna ut den komplexa returtypen från `useAiChat`.
// Detta löser `SIGKILL` (Out of Memory)-felet under `npm run build`.
// `messages` använder nu också den korrekta `Message[]`-typen istället för `any[]`.
// =================================================================================

// Steg 1: Definiera typen explicit istället för att förlita oss på `ReturnType`
interface ChatContextType {
  messages: Message[]; // Använd den importerade typen
  isLoading: boolean;
  session: SessionContextValue;
  sendMessage: (content: string, file?: File) => void;
  clearChat: () => void;
  stop: () => void;
  reload: () => void;
  input: string;
  setInput: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | string) => void;
  handleSubmit: FormEventHandler<HTMLFormElement>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();

  const chatOptions: UseChatOptions = {
    api: '/api/chat',
    onError: (error) => {
      console.error("Fel i AI-chatt:", error);
      toast.error(`Ett fel uppstod: ${error.message}`);
    },
    initialMessages: [
        {
            id: 'initial-welcome',
            role: 'assistant',
            content: 'Välkommen till ByggPilot! Hur kan jag assistera dig idag?'
        }
    ]
  };

  const { 
    messages, 
    append, 
    reload, 
    stop, 
    isLoading, 
    input, 
    setInput, 
    handleInputChange, 
    handleSubmit 
  } = useAiChat(chatOptions);

  const sendMessage = (content: string, file?: File) => {
    if (file) {
      toast.error('Filuppladdning stöds inte i denna version.');
    }
    append({ role: 'user', content });
  };

  const clearChat = () => {
    toast('Funktionen \'Rensa chatt\' är inte fullt implementerad än.');
  };

  // Steg 2: Bygg det explicita värdeobjektet som matchar vår nya, enkla interface
  const value: ChatContextType = {
    messages,
    isLoading,
    session,
    sendMessage,
    stop,
    clearChat,
    reload,
    input,
    setInput,
    handleInputChange,
    handleSubmit
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
