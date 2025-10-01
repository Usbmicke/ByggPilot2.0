
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

      // **KORRIGERINGEN:** Filtrera bort det initiala UI-meddelandet.
      // Detta säkerställer att konversationshistoriken som skickas till API:et
      // alltid startar med ett "user"-meddelande om det är den första vändan.
      const messagesForApi = newMessages.filter((msg, index) => {
        return !(index === 0 && msg.role === 'assistant');
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${idToken}` 
        },
        body: JSON.stringify({ messages: messagesForApi }), // Använder den filtrerade historiken
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Använd den detaljerade felinformationen från servern
        throw new Error(errorData.error || 'Ett okänt serverfel uppstod');
      }
      
      if (!response.body) throw new Error('Saknar svarskropp från servern');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      // Lägg till en platshållare för assistentens svar
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponse += decoder.decode(value, { stream: true });
        // Uppdatera platshållaren med det streamade svaret
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: assistantResponse }];
        });
      }

    } catch (error) {
      console.error("Fel i sendMessage:", error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Ett tekniskt fel uppstod. ${error instanceof Error ? error.message : String(error)}`,
      };
      // Ersätt den tomma platshållaren med felmeddelandet
      setMessages(prev => [...prev.slice(0, -1), errorMsg]);
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
