
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';

// =================================================================================
// GULD STANDARD - CHAT CONTEXT (Klient-sida)
// Version 2.0 - Förbättrad med stabil streaming och prestanda-optimering.
// =================================================================================

/**
 * GULD STANDARD-FÖRBÄTTRING:
 * Varje meddelande får nu ett unikt `id`. Detta är KRITISKT för Reacts prestanda.
 * När meddelandelistan renderas, kan React använda detta `id` som `key` för att
 * omedelbart identifiera vilka meddelanden som är nya eller har ändrats,
 * vilket förhindrar onödiga omritningar av hela listan.
 */
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

const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Sätt upp startmeddelandet vid första renderingen.
    if (messages.length === 0) {
        setMessages([{
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: ONBOARDING_WELCOME_MESSAGE
        }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setIsLoading(true);

    const historyForApi = messages
        .filter(msg => msg.content !== ONBOARDING_WELCOME_MESSAGE) // Filtrera bort välkomstmeddelandet
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

        // =========================================================================
        // GULD STANDARD-FÖRBÄTTRING: Stabil streaming återinförd.
        // Genom att ge varje meddelande ett unikt ID kan React effektivt hantera
        // snabba uppdateringar av det sista meddelandet utan att krascha.
        // =========================================================================
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkValue = decoder.decode(value, { stream: true });
            
            setMessages(prev => {
                // Skapa en ny array för att undvika direkt mutering.
                const newMessages = [...prev];
                // Hitta sista meddelandet (vår platshållare) och uppdatera dess innehåll.
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
            setMessages(prev => prev.slice(0, -2)); // Ta bort både användarens meddelande och platshållaren.
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
