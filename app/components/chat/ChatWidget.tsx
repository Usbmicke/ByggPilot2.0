
'use client';

import { useChat } from 'ai/react';
import { FiSend } from 'react-icons/fi';
import { useEffect, useRef } from 'react';

export function ChatWidget() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const canSubmit = input.trim() !== '' && !isLoading;

  return (
    <div className="flex flex-col h-full bg-background-secondary rounded-lg shadow-2xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-accent-blue' : 'bg-border-primary'} text-text-primary`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border-primary p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            className="flex-1 w-full px-4 py-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-shadow duration-200"
            value={input}
            onChange={handleInputChange}
            placeholder="Skriv ditt meddelande till ByggPilot..."
            aria-label="Chattinmatning"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-text-primary ${canSubmit ? 'bg-accent-blue hover:opacity-90 text-white' : 'bg-border-primary text-text-secondary cursor-not-allowed'}`}
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
