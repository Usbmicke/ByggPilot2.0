
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';
import { uploadFile } from '@/lib/firebase/storage';

// =================================================================================
// GULDSTANDARD V.5.0 - ORCHESTRATOR-INTEGRATION
// Denna version introducerar ett anrop till /api/orchestrator för att hämta
// dynamisk, databas-driven kontext *innan* det primära chattanropet görs.
// =================================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Definierar en ny datastruktur för att skicka till chat API:et
interface ChatApiPayload {
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[];
  data?: { // Extra data som AI:n kan behöva
    context: string;
    source: string;
  };
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

    // Lägg till användarens meddelande i UI direkt för omedelbar respons
    const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // ================== ORCHESTRATOR ANROP ==================
      const orchestratorResponse = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      const orchestratorData = await orchestratorResponse.json();
      // =======================================================
      
      const historyForApi = messages
          .filter(msg => msg.content !== ONBOARDING_WELCOME_MESSAGE)
          .map(msg => ({ 
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
          }));

      const messagesForApi = [...historyForApi, { role: 'user', parts: [{ text: userMessage.content }] }];

      const payload: ChatApiPayload = {
        messages: messagesForApi,
        data: orchestratorData, // Skicka med den dynamiska kontexten
      };

      // Lägg till assistentens platshållare i UI
      setMessages(prev => [...prev, { id: `assistant-${Date.now() + 1}`, role: 'assistant', content: '' }]);

      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
          const errorText = await response.text();
          throw new Error(errorText || 'Okänt serverfel');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunkValue = decoder.decode(value, { stream: true });
          fullResponse += chunkValue;
          setMessages(prev => {
              const newArr = [...prev];
              newArr[newArr.length - 1].content = fullResponse;
              return newArr;
          });
      }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.log("Fetch avbröts av användaren.");
            return;
        }

        console.error("Fel i sendMessage:", error);
        const errorContent = `Ett tekniskt fel uppstod: ${error.message}`;
        setMessages(prev => {
            const newArr = [...prev];
            if (newArr.length > 0 && newArr[newArr.length - 1].role === 'assistant' && newArr[newArr.length - 1].content === '') {
                 newArr.pop();
            }
            return [...newArr, { id: `assistant-error-${Date.now()}`, role: 'assistant', content: errorContent }];
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
