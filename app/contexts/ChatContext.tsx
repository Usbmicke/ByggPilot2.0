
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChatMessage } from '@/app/types';
import { useUI } from '@/app/contexts/UIContext';
import { auth } from '@/app/lib/firebase/client';
import { User, onAuthStateChanged } from 'firebase/auth';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  firebaseUser: User | null;
  sendMessage: (content: string, file?: File) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const { openModal } = useUI();

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

  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!content.trim() && !file || !firebaseUser) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    
    setMessages(newMessages);
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
        body: JSON.stringify({ messages: messagesForApi }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ett okänt serverfel uppstod');
      }
      
      // **NY LOGIK: Hantera JSON-svar, inte stream**
      const responseData = await response.json();
      const assistantContent = responseData.text;

      if (!assistantContent) {
        throw new Error("Fick ett tomt eller felformaterat svar från servern.");
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantContent,
      };

      // Lägg till det kompletta svaret i chatthistoriken
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Fel i sendMessage:", error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Ett tekniskt fel uppstod. ${error instanceof Error ? error.message : String(error)}`,
      };
      // Lägg till felmeddelandet i chatthistoriken
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, messages]);

  const value = { messages, isLoading, firebaseUser, sendMessage };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
