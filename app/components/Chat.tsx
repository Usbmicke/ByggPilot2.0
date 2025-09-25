
'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import MessageList from '@/app/components/messages/MessageList';
import MessageInput from '@/app/components/messages/MessageInput';
import SuggestedActions from '@/app/components/messages/SuggestedActions';
import { UIContext } from '@/app/contexts/UIContext';
import { type Message } from '@/app/types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { openModal } = useContext(UIContext);

  // Initialt välkomstmeddelande från AI
  useEffect(() => {
    setMessages([
      {
        id: 'initial-welcome',
        text: 'Hej! Jag är din digitala byggassistent. Hur kan jag hjälpa dig idag? Du kan till exempel be mig att skapa ett nytt projekt, en ny kund eller göra en riskanalys.',
        sender: 'ai',
        actions: [
          { action: 'createProject', label: 'Skapa nytt projekt' },
          { action: 'createCustomer', label: 'Skapa ny kund' },
        ]
      }
    ]);
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Fel: ${response.statusText}`);
      }

      const aiData = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiData.text || 'Jag fick ett oväntat svar. Försök igen.',
        sender: 'ai',
        actions: aiData.actions || [],
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      console.error("sendMessage error:", err);
      // Korrigerat felmeddelande
      const friendlyError = 'Kunde inte få svar från assistenten. Kontrollera att din GEMINI_API_KEY är korrekt inställd i .env.local och försök igen.';
      setError(friendlyError);
      const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: friendlyError,
          sender: 'ai',
      }
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string, payload?: any) => {
    openModal(action, payload);
  };

  return (
    <div className="flex flex-col h-full bg-background-primary">
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="p-4 md:p-6 border-t border-border-primary bg-background-secondary">
        {messages.length > 0 && (
          <SuggestedActions 
            actions={messages[messages.length - 1].sender === 'ai' ? messages[messages.length - 1].actions : []} 
            onActionClick={handleActionClick} 
          />
        )}
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        {error && 
          <p className="text-sm text-status-danger mt-2 text-center">{error}</p>
        }
      </div>
    </div>
  );
};

export default Chat;
