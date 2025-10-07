
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';
import { uploadFile } from '@/lib/firebase/storage';

// =================================================================================
// GULD STANDARD - CHAT CONTEXT (Klient-sida)
// Version 3.3 - Korrigerat dubbel historik-bugg.
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
        userMessageContent = `${content}\n(Bifogad fil: ${file.name})`
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
    
    const assistantPlaceholder: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: ''
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

    // KORRIGERING: Skickar nu BARA det nya meddelandet. Servern hanterar historiken.
    const messageForApi = { role: 'user', parts: [{ text: userMessage.content }] };

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [messageForApi], fileUris }), // Skickar bara det nya meddelandet i en array
            signal: abortControllerRef.current.signal,
        });

        if (!response.ok || !response.body) {
            const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel' }));
            throw new Error(errorData.error || 'Ett okänt serverfel uppstod.');
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
