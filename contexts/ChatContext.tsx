
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { submit } from '@/app/actions/chat'; // Direktimport av server-action

// Definierar typerna för meddelanden
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
}

// Definierar typen för kontext-värdet
export interface ChatContextType {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

// Skapar kontexten med ett initialt null-värde
export const ChatContext = createContext<ChatContextType | null>(null);

// Hook för att enkelt kunna använda kontexten
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Provider-komponenten som omsluter applikationen
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: nanoid(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Anropar server-action direkt
      const aiResponse = await submit(input);

      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: aiResponse, // Svaret från server-action
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error submitting chat:', error);
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: 'Ett fel uppstod. Vänligen försök igen.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const value = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
