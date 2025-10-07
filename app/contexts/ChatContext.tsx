'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';
import { uploadFile } from '@/lib/firebase/storage';

// =================================================================================
// GULDSTANDARD V.4.0 - SLUTGILTIG SYNkronisering
// Återställer klient-sida-formatering för att matcha Server API v11.0.
// Detta är den korrekta, stabila arkitekturen.
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
  sendMessage: (content: string, file?: File) => Promise<void>;
  stop: () => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_HISTORY_STORAGE_KEY = 'byggpilot.chatHistory.v1';
const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

const createWelcomeMessage = (): ChatMessage => ({
  id: `assistant-${Date.now()}`,
  role: 'assistant',
  content: ONBOARDING_WELCOME_MESSAGE
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
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
    return [createWelcomeMessage()];
  });

  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (messages.length > 1 || (messages.length === 1 && messages[0].content !== ONBOARDING_WELCOME_MESSAGE)) {
        localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
      }
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

  const clearChat = useCallback(() => {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    setMessages([createWelcomeMessage()]);
  }, []);

  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (session.status !== 'authenticated' || (!content.trim() && !file)) return;

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    let fileUris: string[] = [];
    let userMessageContent = content;

    if (file) {
      try {
        const downloadURL = await uploadFile(file);
        fileUris.push(downloadURL);
        userMessageContent = `${content}\n(Bifogad fil: ${file.name}`;
      } catch (error) {
        console.error("Filuppladdning misslyckades:", error);
        const errorMsg: ChatMessage = {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: `Det gick inte att ladda upp filen: ${file.name}. Försök igen.`
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }
    }

    const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessageContent
    };

    // Lägg till användarens meddelande i UI direkt
    const newMessagesWithUser = [...messages, userMessage];
    setMessages(newMessagesWithUser);

    // =============================================================================
    // SLUTGILTIG KORRIGERING: Återställ klient-sida-formateringen.
    // Klienten SKA formatera datan till det Google-specifika `Content`-formatet.
    // Servern (v11.0) är nu byggd för att ta emot exakt detta format.
    // =============================================================================
    const historyForApi = messages
        .filter(msg => msg.content !== ONBOARDING_WELCOME_MESSAGE)
        .map(msg => ({ 
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

    const messagesForApi = [...historyForApi, { role: 'user', parts: [{ text: userMessage.content }] }];

    // Lägg till assistentens platshållare i UI EFTER att API-payloaden har skapats
    setMessages(prev => [...prev, { id: `assistant-${Date.now() + 1}`, role: 'assistant', content: '' }]);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messagesForApi, fileUris }),
            signal: abortControllerRef.current.signal,
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            let errorDetails = 'Okänt serverfel';
            try { errorDetails = JSON.parse(errorText).details || errorText; } catch (e) { errorDetails = errorText; }
            throw new Error(errorDetails);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Nollställ innehållet i platshållaren
        setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { ...newArr[newArr.length - 1], content: '' };
            return newArr;
        });

        // Streama svaret
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunkValue = decoder.decode(value, { stream: true });
            setMessages(prev => {
                const newArr = [...prev];
                const lastIdx = newArr.length - 1;
                newArr[lastIdx].content += chunkValue;
                return newArr;
            });
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.log("Fetch avbröts av användaren.");
            setMessages(prev => prev.slice(0, -1)); // Ta bara bort platshållaren
            return;
        }

        console.error("Fel i sendMessage:", error);
        const errorContent = `Ett tekniskt fel uppstod: ${error.message}`;
        
        setMessages(prev => {
            const withoutPlaceholder = prev.slice(0, -1);
            const errorMsg: ChatMessage = { id: `assistant-error-${Date.now()}`, role: 'assistant', content: errorContent };
            return [...withoutPlaceholder, errorMsg];
        });
    } finally {
        setIsLoading(false);
    }
  }, [session, messages]);

  const value = { messages, isLoading, session, sendMessage, stop, clearChat };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
