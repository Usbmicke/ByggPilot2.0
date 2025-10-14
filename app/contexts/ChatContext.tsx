
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { API_CHAT } from '@/constants/apiRoutes';

// Definierar typen för ett enskilt chattmeddelande
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Definierar typen för kontextens värde
interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  append: (content: string) => Promise<void>; // Döpte om sendMessage till append
}

// Skapar kontexten med ett initialt värde av undefined
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Props för ChatProvider-komponenten
interface ChatProviderProps {
  children: ReactNode;
}

// Huvudprovider-komponenten som omsluter applikationen
export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Funktion för att skicka ett meddelande till backend
  const append = async (content: string) => { // Döpte om sendMessage till append
    setIsLoading(true);
    setError(null);

    // Lägg till användarens meddelande i state direkt
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    
    // **BUGGFIX:** Skapa den nya meddelandelistan FÖRST.
    // Detta förhindrar att ett "stale" state skickas till API:et.
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Förbered för assistentens svar
    const assistantMessageId = `asst-${Date.now()}`;
    let assistantMessageContent = '';

    try {
      const response = await fetch(API_CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }), // Skicka den nya, korrekta listan
      });

      if (!response.ok) {
        throw new Error(`API-fel: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Fick inget svar från servern.');
      }

      // Hantera streamen från servern
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Lägg till ett tomt assistentmeddelande direkt för att visa att svaret påbörjats
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;

        // Uppdatera assistentens meddelande i realtid
        setMessages(prev => 
            prev.map(m => 
                m.id === assistantMessageId ? { ...m, content: assistantMessageContent } : m
            )
        );
      }

    } catch (err: any) {
      setError(err);
      console.error("Fel vid sändning av meddelande:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, error, append }}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook för att enkelt använda ChatContext
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
}
