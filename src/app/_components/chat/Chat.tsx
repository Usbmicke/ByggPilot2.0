
'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Message } from '@/app/_lib/genkit'; // GULDSTANDARD: Importera från central plats


// =======================================================================
//  CHATT-KOMPONENT (VERSION 3.1 - CENTRALISERAD TYP)
//  Denna version använder den centralt definierade `Message`-typen från genkit.ts
// =======================================================================

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Vi behöver inte `id` längre, eftersom Zod-schemat inte har det.
    // Reacts `key` kommer att hanteras av index i `map`-funktionen.
    const newUserMessage: Message = {
      role: 'user',
      content: input,
    };

    // Skapa en temporär meddelandelista för API-anropet
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Skicka hela den uppdaterade meddelandelistan
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ett fel uppstod vid anrop till chat-API:et');
      }

      const result = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Fel vid hämtning av chattsvar:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Jag kunde tyvärr inte svara just nu. Försök igen om en liten stund.',
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]); // Ersätt användarens meddelande med felmeddelandet
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);


  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsExpanded(false);
  };

  const stop = () => setIsLoading(false);

  return (
    <div className="flex-shrink-0 bg-[#1C1C1E] border-t border-neutral-800/50 p-4">
        <div className={`mx-auto max-w-3xl transition-all duration-300 ease-in-out`}>

            {isExpanded && (
                <div 
                    className="bg-[#111113] border border-neutral-700/80 rounded-t-xl shadow-2xl mb-4 animate-slide-up"
                    style={{ height: '65vh', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="flex justify-between items-center p-4 border-b border-neutral-800 flex-shrink-0">
                        <h3 className="font-bold text-lg text-gray-200">Fråga ByggPilot AI...</h3>
                        <button onClick={handleClose} className="p-1 hover:bg-neutral-700 rounded-full">
                            <XMarkIcon className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <ChatMessages messages={messages} isLoading={isLoading} />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                 <ChatInput
                    input={input}
                    handleInputChange={handleInputChange}
                    onFocus={handleFocus}
                    isLoading={isLoading}
                    onStop={stop}
                    placeholder="Fråga ByggPilot AI, t.ex. 'Skapa ett nytt projekt för Brf. Eken'..."
                 />
            </form>
        </div>
    </div>
  );
}
