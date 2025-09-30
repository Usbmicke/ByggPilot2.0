
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChatMessage, FileAttachment } from '@/app/types';
import { useUI, UIAction } from '@/app/contexts/UIContext';
import { auth } from '@/app/lib/firebase/client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { SYSTEM_PROMPT } from '@/app/ai/prompts';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

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
  }, []); // Körs endast en gång vid montering

  const sendMessage = useCallback(async (content: string, file?: File) => {
    if ((!content || !content.trim()) && !file || !firebaseUser) return;

    let userMessage: ChatMessage;
    const tempId = `temp_${Date.now()}`;

    // Skapa och lägg till meddelandet direkt
    // Hantera fil-logik här om det behövs
    userMessage = { role: 'user', content: content };
    
    // Bygg den nya meddelandelistan FÖRST
    const newMessages: ChatMessage[] = [...messages, userMessage];
    // Uppdatera state direkt så att UI:t reagerar
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const idToken = await firebaseUser.getIdToken(true);
      const systemMessage: ChatMessage = { role: 'system', content: SYSTEM_PROMPT };
      const messagesToSend = [systemMessage, ...newMessages];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Okänt serverfel');
      }
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

    } catch (error) {
      console.error("Fel i sendMessage:", error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Ett tekniskt fel uppstod: ${error instanceof Error ? error.message : String(error)}`,
      };
       // Ersätt den väntande "..." med ett felmeddelande
      setMessages(prev => [...prev.slice(0, -1), errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, messages, openModal]);

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
