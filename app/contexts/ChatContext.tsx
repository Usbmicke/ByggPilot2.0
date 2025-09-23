'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChatMessage } from '@/app/types';
import { useUI, UIAction } from '@/app/contexts/UIContext'; // KORRIGERAD SÖKVÄG
import { auth } from '@/app/lib/firebase/client';
import { User, onAuthStateChanged } from 'firebase/auth';

// Typ för kontextens värde
interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  firebaseUser: User | null;
  sendMessage: (content: string) => Promise<void>;
}

// Skapa kontexten
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Onboarding-meddelande
const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

// Provider-komponent
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const { openModal } = useUI();

  // Hantera användarens autentiseringsstatus
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
  }, [messages.length]);

  // Kärnfunktionen för att skicka meddelanden till AI:n
  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !firebaseUser) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmedContent };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Okänt serverfel');
      if (!response.body) throw new Error('Saknar svarskropp');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponse += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: assistantResponse }];
        });
      }

      // Hantera UI Actions
      try {
        const parsedAction: UIAction = JSON.parse(assistantResponse);
        if (parsedAction.type === 'UI_ACTION' && parsedAction.action === 'open_modal') {
          openModal(parsedAction.payload.modalId, parsedAction.payload);
          setMessages(prev => prev.slice(0, -1)); // Ta bort action-meddelandet
        }
      } catch (e) { /* Inte en UI action, fortsätt som vanligt */ }

    } catch (error) {
      console.error("Fel i sendMessage:", error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Ett tekniskt fel uppstod: ${error instanceof Error ? error.message : String(error)}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, messages, openModal]);

  const value = { messages, isLoading, firebaseUser, sendMessage };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook för att enkelt komma åt kontexten
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
