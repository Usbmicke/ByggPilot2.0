'use client';

import React, { useState, FormEvent } from 'react';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { ChevronDownIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { callGenkitFlow } from '@/lib/genkit';
import { Message } from 'ai'; // Återanvänd Message-typen för struktur

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setInput(''); // Rensa input direkt

    try {
      // ANROP TILL GENKIT - FÖRBERETT FÖR FRAMTIDEN
      const response = await callGenkitFlow<string>('geminiProChat', { message: input, history: messages });

      const assistantMessage: Message = { id: Date.now().toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Fel vid anrop av chatt-flöde:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Tyvärr, jag kunde inte ansluta till AI-assistenten just nu.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-50"
        aria-label="Öppna chatt"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[70vh] max-h-[700px] bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-gray-200 flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-lg text-gray-800">ByggPilot Co-Pilot</h3>
        <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
            <ChevronDownIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
         <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSubmit}>
            <ChatInput
                input={input}
                handleInputChange={(e) => setInput(e.target.value)}
                isLoading={isLoading}
                onStop={() => { /* Stopp-logik kan implementeras här om Genkit-flödet stödjer det */ }}
            />
        </form>
      </div>
    </div>
  );
}
