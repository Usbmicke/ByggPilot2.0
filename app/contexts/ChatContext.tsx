
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Message, useChat } from '@ai-sdk/react'; // KORREKT IMPORT FÖR V3
import { v4 as uuidv4 } from 'uuid';

// =================================================================================
// GULD STANDARD - CHAT CONTEXT
// Version 11.0 - Synkroniserad med Beroenden.
// =================================================================================

type ChatContextType = {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  sendMessage: (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
  reload: () => void;
  stop: () => void;
  isLoading: boolean;
  error: Error | undefined;
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
    handleSubmit, 
    reload, 
    stop, 
    isLoading, 
    error 
  } = useChat({
    api: '/api/chat',
    initialMessages: [],
    onFinish: () => {
      console.log('[ChatProvider] Stream avslutad.');
    },
    onError: (e) => {
        console.error('[useChat OnError]', e);
        // Egentlig felhantering sker i den anpassade `sendMessage` nedan.
    }
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
        console.log('[AuthProvider] Status: Synced.');
        setIsReady(true);
    } else if (status === 'unauthenticated') {
        console.log('[AuthProvider] Status: Ej autentiserad.');
        setIsReady(true);
    }
  }, [status, session]);

  const customHandleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
        handleSubmit(e as React.FormEvent<HTMLFormElement>);
    } catch (err) {
        console.error('[ChatProvider] Fel i sendMessage anrop:', err);

        const errorId = uuidv4();
        const errorMessage: Message = {
            id: errorId,
            role: 'assistant',
            content: `**Systemfel:** Jag kunde inte slutföra din begäran. Servern svarade med ett fel. Försök igen, eller kontakta support om problemet kvarstår. \n\n*Felinformation: ${err instanceof Error ? err.message : 'Okänt fel'}*`,
            createdAt: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  }, [handleSubmit, setMessages]);


  const contextValue: ChatContextType = {
    messages,
    input,
    handleInputChange,
    sendMessage: customHandleSubmit, 
    reload,
    stop,
    isLoading,
    error,
  };

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
