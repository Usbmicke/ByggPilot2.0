'use client';

import { useUIState, useActions } from 'ai/rsc';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AI } from '@/app/action';

// =================================================================================
// CHAT COMPONENT V1.0 - GULDSTANDARD
// BESKRIVNING: Huvudkomponenten för AI-chatten. Den hanterar användarinput,
// visar konversationshistoriken (via `useUIState`) och anropar AI-actions
// (via `useActions`). Detta är den centrala interaktionspunkten för användaren
// med AI-systemet.
// =================================================================================

export function Chat() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submit } = useActions<typeof AI>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Lägg till användarens meddelande i UI-tillståndet
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: Date.now(),
        role: 'user',
        display: <div>{inputValue}</div>
      }
    ]);
    
    // Anropa server-action med användarens input
    const responseMessage = await submit(inputValue);
    setMessages(currentMessages => [
        ...currentMessages,
        responseMessage
    ]);

    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message: any) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {message.display}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex items-center space-x-2">
             <Input
                type="text"
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                placeholder="Fråga din AI-assistent..."
                className="flex-grow"
            />
            <Button type="submit">Skicka</Button>
          </div>
      </form>
    </div>
  );
}
