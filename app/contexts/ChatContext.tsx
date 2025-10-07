
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Message, useChat } from '@ai-sdk/react';
import { v4 as uuidv4 } from 'uuid';

// =================================================================================
// GULDSTANDARD - CHAT CONTEXT
// Version 13.0 - Stabil, med Välkomstmeddelande & Korrekt Felhantering
// =================================================================================

type ChatContextType = {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  sendMessage: (e: React.FormEvent<HTMLFormElement>) => void; // Förenklad signatur
  reload: () => void;
  stop: () => void;
  isLoading: boolean;
  error: Error | undefined;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [isReady, setIsReady] = useState(false);

  const { 
    messages, 
    setMessages, 
    input, 
    handleInputChange, 
    handleSubmit, // Detta är den rena funktionen från useChat
    reload, 
    stop, 
    isLoading, 
    error 
  } = useChat({
    api: '/api/chat',
    // STEG 1: Återinför ett initialt välkomstmeddelande.
    initialMessages: [
        {
            id: uuidv4(),
            role: 'assistant',
            content: 'Hej! Jag är ByggPilot, din AI-assistent. Hur kan jag hjälpa dig att planera och effektivisera ditt arbete idag?'
        }
    ],
    // STEG 2: Implementera robust felhantering på det korrekta sättet.
    onError: (err) => {
        console.error('[useChat OnError]', err);
        const errorId = uuidv4();
        const errorMessage: Message = {
            id: errorId,
            role: 'assistant',
            content: `**Systemfel:** Jag kunde inte slutföra din begäran. Servern svarade med ett fel. Försök igen, eller kontakta support om problemet kvarstår. \n\n*Fel: ${err.message}*`,
            createdAt: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    },
    onFinish: () => {
      console.log('[ChatProvider] Stream avslutad.');
    }
  });

  useEffect(() => {
    if (status === 'authenticated' || status === 'unauthenticated') {
        setIsReady(true);
    }
  }, [status]);


  const contextValue: ChatContextType = {
    messages,
    input,
    handleInputChange,
    // STEG 3: Exportera den rena, oförändrade handleSubmit-funktionen.
    sendMessage: handleSubmit, 
    reload,
    stop,
    isLoading,
    error,
    setMessages,
  };

  // Säkerställ att contexten inte renderar sitt innehåll förrän sessionstatus är känd,
  // för att undvika race conditions.
  if (!isReady) {
    return null; 
  }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
