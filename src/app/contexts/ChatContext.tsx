
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '@/app/types';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  startNewChat: () => void;
  sendMessage: (message: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const startNewChat = () => {
    setMessages([]);
  };

  const sendMessage = async (message: string) => {
    console.log("Skickar meddelande (platshållare):", message);
    // VÄRLDSKLASS-KORRIGERING: Använder 'timestamp' i enlighet med ChatMessage-typen.
    const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const value = {
    messages,
    setMessages,
    startNewChat,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
