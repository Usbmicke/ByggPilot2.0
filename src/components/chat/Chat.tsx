
'use client';

import { useChat } from '@ai-sdk/react';
import React, { useState, FormEvent } from 'react';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { ChevronDownIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  // useChat hanterar meddelandehistorik, laddningsstatus och kommunikation
  const { messages, append, isLoading } = useChat({
    api: '/api/genkit/chat',
  });

  // Lokal state för att hantera värdet i textfältet
  const [input, setInput] = useState('');

  // Hanterar formulärinskickning
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Skicka det nuvarande meddelandet via useChat-hookens append-funktion
    append({ role: 'user', content: input });

    // Rensa textfältet efter att meddelandet har skickats
    setInput('');
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-transform hover:scale-110 z-50 animate-fadeIn"
        aria-label="Öppna chatt"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[70vh] max-h-[700px] bg-background-primary shadow-2xl rounded-2xl border border-border-color flex flex-col z-50 animate-slideInUp">
      <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
        <h3 className="font-bold text-lg">ByggPilot Co-Pilot</h3>
        <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-background-secondary rounded-full">
            <ChevronDownIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
         <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      <div className="p-4 border-t border-border-color flex-shrink-0">
        <form onSubmit={handleSubmit}>
            <ChatInput
                input={input} // Skicka ner nuvarande input-värde
                setInput={setInput} // Skicka ner funktionen för att uppdatera det
                isLoading={isLoading}
                onStop={() => { /* Stopp-logik kan implementeras här */ }}
            />
        </form>
      </div>
    </div>
  );
}
