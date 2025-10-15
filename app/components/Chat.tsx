'use client'; // <-- DEN AVGÖRANDE RADEN SOM SAKNADES

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/app/contexts/ChatContext';
import ButtonSuggestions from './ButtonSuggestions';

// =================================================================================
// CHAT WIDGET V2.2 - "USE CLIENT" FIX
// ARKITEKTUR:
// 1.  **"use client" Direktiv:** Lade till direktivet högst upp i filen. Detta
//     instruerar Next.js att rendera denna komponent på klientsidan, vilket 
//     tillåter användning av interaktiva hooks som useState och useEffect. 
//     Detta löser applikationskraschen.
// =================================================================================

const Chat = () => {
  const { messages, isLoading, append } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      append(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    append(suggestion);
  };

  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[600px] flex flex-col bg-component-background border border-border rounded-lg shadow-2xl font-sans z-50">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">ByggPilot Co-Pilot</h2>
        <p className="text-sm text-text-secondary">Din digitala kollega, redo att hjälpa.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-accent text-white' : 'bg-background text-text-primary'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              {m.role === 'assistant' && <ButtonSuggestions text={m.content} onClick={handleSuggestionClick} />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-background text-text-primary">
                <span className="animate-pulse">●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv ett meddelande..."
              className="w-full bg-background border border-border rounded-md pl-4 pr-12 py-3 text-text-primary focus:ring-accent focus:border-accent"
              disabled={isLoading}
            />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-text-secondary hover:text-accent disabled:opacity-50" disabled={isLoading || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
