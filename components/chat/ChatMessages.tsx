
'use client';

import { CoreMessage } from 'ai';
import { Message } from './Message'; // Vi skapar denna komponent härnäst
import { Bot, User } from 'lucide-react';
import { BeatLoader } from 'react-spinners';

// =================================================================================
// CHAT-MEDDELANDEN (v1.0 - Skapad)
//
// Beskrivning: Denna komponent ansvarar för att rendera listan med meddelanden
//              i en konversation. Den var tidigare saknad, vilket orsakade en krasch.
// =================================================================================

interface ChatMessagesProps {
  messages: CoreMessage[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  
  // Om det inte finns några meddelanden OCH AI:n inte laddar, visa ett välkomstmeddelande.
  if (!messages.length && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
        <Bot size={48} className="mb-4 text-gray-500" />
        <h2 className="text-2xl font-semibold text-gray-300">Starta en ny konversation</h2>
        <p className="max-w-md mt-2">Fråga mig om projekt, kunder, eller be mig skapa en offert. Jag är här för att hjälpa dig!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((m, index) => (
        <Message key={index} message={m} />
      ))}
      
      {/* Visa en laddningsindikator när AI:n svarar */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 flex-shrink-0">
            <Bot size={18} className="text-gray-300" />
          </div>
          <div className="bg-gray-700 rounded-2xl px-4 py-2.5 max-w-[80%] whitespace-pre-wrap">
             <BeatLoader color="#9ca3af" size={8} />
          </div>
        </div>
      )}
    </div>
  );
}
