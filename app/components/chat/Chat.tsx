
'use client';

import React, { useState } from 'react';
import MessageInput from './MessageInput';
import SuggestedActions, { ActionSuggestion } from './SuggestedActions';
import { useUI } from '@/app/context/UIContext';

// Typ för ett meddelande i chatten
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// Denna komponent är huvudcontainern för hela chattupplevelsen.
const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const { openModal } = useUI();

  const handleSendMessage = async (message: { text: string; files?: File[] }) => {
    // Steg 1: Lägg till användarens meddelande direkt i listan
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.text,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setSuggestions([]); // Rensa gamla förslag

    // Steg 2: Skicka meddelandet till vårt AI-backend (simulerat för nu)
    // TODO: Ersätt detta med ett riktigt API-anrop till en AI-tjänst
    const aiResponseText = `Jag förstod att du sa: "${message.text}".`;
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: 'ai'
    };
    
    // Simulera en fördröjning för realism
    setTimeout(() => {
      setMessages(prev => [...prev, aiMessage]);

      // Steg 3: Generera kontextuella förslag baserat på meddelandet
      if (message.text.toLowerCase().includes('nytt projekt')) {
        setSuggestions([
          {
            label: 'Skapa nytt projekt?',
            action: () => openModal('createProject', { projectName: 'Altanbygge' })
          },
          {
            label: 'Skapa ny kund?',
            action: () => openModal('createCustomer')
          }
        ]);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-background-secondary">
      {/* ---- Meddelandelista ---- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.sender === 'user' ? 'bg-accent-blue text-white' : 'bg-background-tertiary text-text-primary'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Föreslagna handlingar ---- */}
      <SuggestedActions suggestions={suggestions} />

      {/* ---- Input-fält ---- */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
