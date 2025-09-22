
'use client';

import { useChat } from 'ai/react';
import { FiSend } from 'react-icons/fi';
import { useEffect, useRef } from 'react';

export function ChatWidget() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Skrolla automatiskt till det senaste meddelandet
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Styr knappens utseende baserat på input och laddningsstatus
  const canSubmit = input.trim() !== '' && !isLoading;

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-2xl">
      {/* Meddelande-fönstret */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {/* Tom div för att kunna skrolla längst ner */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input-fält och skicka-knapp */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            className="flex-1 w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-200"
            value={input}
            onChange={handleInputChange}
            placeholder="Skriv ditt meddelande till ByggPilot..."
            aria-label="Chattinmatning"
            disabled={isLoading} // Inaktivera input när AI svarar
          />
          <button 
            type="submit"
            className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${canSubmit ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            disabled={!canSubmit}
            aria-label="Skicka meddelande"
          >
            <FiSend className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
