
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';

// =================================================================================
// GULD STANDARD - CHAT CONTEXT (Klient-sida)
// Version 3.0 - Infört persistent chatthistorik via localStorage.
// =================================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  session: SessionContextValue;
  sendMessage: (content: string, fileUris?: string[]) => Promise<void>;
  stop: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_HISTORY_STORAGE_KEY = 'byggpilot.chatHistory.v1';
const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // GULD STANDARD-FÖRBÄTTRING: Initiera state från localStorage.
  // Detta körs bara en gång vid första renderingen för att ladda sparad historik.
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const storedMessages = typeof window !== 'undefined' ? localStorage.getItem(CHAT_HISTORY_STORAGE_KEY) : null;
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      }
    } catch (error) {
      console.error("Kunde inte ladda chatthistorik från localStorage", error);
    }
    // Om ingen historik finns, returnera standard-välkomstmeddelandet.
    return [{ id: `assistant-${Date.now()}`, role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }];
  });

  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);

  // GULD STANDARD-FÖRBÄTTRING: Spara meddelanden till localStorage vid varje ändring.
  // Detta säkerställer att chatthistoriken alltid är uppdaterad.
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Kunde inte spara chatthistorik till localStorage", error);
    }
  }, [messages]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, fileUris?: string[]) => {
    if (session.status !== 'authenticated' || (!content.trim() && (!fileUris || fileUris.length === 0))) return;

    abortControllerRef.current = new AbortController();

    const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content
    };
    
    const assistantPlaceholder: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: ''
    };

    // Uppdatera state direkt med det nya meddelandet och platshållaren
    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);
    setIsLoading(true);

    const historyForApi = messages
        .filter(msg => msg.content !== ONBOARDING_WELCOME_MESSAGE)
        .map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));

    const messagesForApi = [...historyForApi, { role: 'user', parts: [{ text: userMessage.content }] }];

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messagesForApi, fileUris }),
            signal: abortControllerRef.current.signal,
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            throw new Error(JSON.parse(errorText).error || 'Ett okänt serverfel uppstod.');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { ...newArr[newArr.length - 1], content: '' };
            return newArr;
        });

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkValue = decoder.decode(value, { stream: true });
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessageIndex = newMessages.length - 1;
                newMessages[lastMessageIndex] = {
                    ...newMessages[lastMessageIndex],
                    content: newMessages[lastMessageIndex].content + chunkValue,
                };
                return newMessages;
            });
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.log("Fetch aborted by user.");
            setMessages(prev => prev.slice(0, -2)); 
            return;
        }

        console.error("Fel i sendMessage:", error);
        const errorContent = `Ett tekniskt fel uppstod: ${error.message}`;
        
        setMessages(prev => {
            const withoutPlaceholder = prev.slice(0, -1);
            const errorAssistantMessage: ChatMessage = {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                content: errorContent
            };
            return [...withoutPlaceholder, errorAssistantMessage];
        });
    } finally {
        setIsLoading(false);
    }
  }, [session, messages]);

  const value = { messages, isLoading, session, sendMessage, stop };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
