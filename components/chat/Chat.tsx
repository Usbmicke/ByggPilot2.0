
'use client';

import { useChat } from '@/contexts/ChatContext';
import { Paperclip, Send } from 'lucide-react';

// =================================================================================
// CHAT UI V4.0 - PLATINUM STANDARD
//
// Beskrivning: Detta är den enda, enhetliga komponenten för hela chattgränssnittet.
// Den använder den nya, robusta ChatContext för all state och logik.
// Designen är ren, minimal och fokuserad på Platinum Standard-principer.
// =================================================================================

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 md:left-64"> {/* Anpassad för att fungera med sidofältet */}
      <div className="max-w-4xl mx-auto">
        {/* MEDDELANDELISTA */}
        <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-700 rounded-lg">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 my-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>}
              <div className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-gray-600' : 'bg-gray-900'}`}>
                {typeof m.content === 'string' ? <p>{m.content}</p> : m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 my-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <p className="animate-pulse">...</p>
              </div>
            </div>
          )}
        </div>

        {/* INPUT-FÄLT */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button type="button" className="p-2 hover:bg-gray-600 rounded-full">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Skriv ditt meddelande..."
            className="flex-grow p-2 bg-gray-600 rounded-full focus:outline-none"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full disabled:bg-gray-500">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
