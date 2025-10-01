
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { ChatMessage } from '@/app/types';
import { useUI } from '@/app/contexts/UIContext';
import { auth } from '@/app/lib/firebase/client';
import { User, onAuthStateChanged } from 'firebase/auth';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  firebaseUser: User | null;
  sendMessage: (content: string, file?: File) => Promise<void>;
  stop: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const { openModal } = useUI();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && messages.length === 0) {
        setMessages([{ role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }]);
      } else if (!user) {
        setMessages([{ role: 'assistant', content: "Vänligen logga in för att använda chatten." }]);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!content.trim() && !file || !firebaseUser) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const userMessage: ChatMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];

    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
        const idToken = await firebaseUser.getIdToken(true);

        const messagesForApi = newMessages.filter((msg, index) => {
            return !(index === 0 && msg.role === 'assistant');
        });

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            // Inkludera userId i anropet
            body: JSON.stringify({ messages: messagesForApi, userId: firebaseUser.uid }),
            signal: signal, 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ett serverfel uppstod');
        }

        if (!response.body) {
            throw new Error("Fick ett tomt svar från servern.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkValue = decoder.decode(value);
            
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                const updatedLastMessage = {
                    ...lastMessage,
                    content: lastMessage.content + chunkValue,
                };
                return [...prev.slice(0, -1), updatedLastMessage];
            });
        }
        setIsLoading(false);

    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.log("Fetch aborted by user.");
            setMessages(prev => prev.slice(0, -1)); 
            return; 
        }
        console.error("Fel i sendMessage (streaming):", error);
        const errorContent = `Ett tekniskt fel uppstod. ${error instanceof Error ? error.message : String(error)}`;
        
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            const updatedLastMessage = { ...lastMessage, content: errorContent };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
        setIsLoading(false);
    }
}, [firebaseUser, messages]);

  const value = { messages, isLoading, firebaseUser, sendMessage, stop };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
