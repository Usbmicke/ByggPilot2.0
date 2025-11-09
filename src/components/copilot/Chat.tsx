'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChevronUp, Send } from 'lucide-react';

// ===================================================================================================
// CHAT RECONSTRUCTION V2.0 - FOCUS RESTORATION
// ===================================================================================================
// Återinför den kritiska fokus-hanteringen med `useRef` och `useEffect`. När chatten expanderar,
// förloras fokus. Denna kod tvingar fokus tillbaka till input-fältet, vilket stabiliserar
// komponenten och låter `useChat`-hookens `handleSubmit` fungera korrekt.

export default function Chat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
      api: '/api/chat',
  });

  // K R I T I S K   F O K U S - H A N T E R I N G
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const commonContainerClasses = `absolute z-10 transition-all duration-500 ease-in-out border shadow-2xl rounded-xl`;
  const collapsedClasses = `bottom-8 left-8 right-8 h-16 bg-background-secondary border-border-color/80`;
  const expandedClasses = `top-8 bottom-8 left-8 right-8 bg-background-secondary/90 backdrop-blur-md border-blue-500/30`;

  return (
    <div className={`${commonContainerClasses} ${isExpanded ? expandedClasses : collapsedClasses}`}>
      {isExpanded ? (
        // ----- EXPANDERAT LÄGE -----
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border-color/80">
            <h2 className="text-lg font-bold">ByggPilot Co-Pilot</h2>
            <button onClick={() => setIsExpanded(false)} className="py-1 px-3 text-sm rounded-md hover:bg-background-tertiary">
              Stäng
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(m => (
                <div key={m.id} className={`whitespace-pre-wrap flex flex-col items-${m.role === 'user' ? 'end' : 'start'}`}>
                    <div className={`p-3 rounded-lg max-w-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background-tertiary'}`}>
                        <span className="font-bold capitalize">{m.role === 'assistant' ? 'ByggPilot' : 'Du'}</span>
                        <p>{m.content}</p>
                    </div>
                </div>
            ))}
          </div>

          <div className="p-4 border-t border-border-color/80">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3 h-full w-full bg-background-tertiary rounded-lg px-4 ring-2 ring-transparent focus-within:ring-blue-500">
              <input
                ref={inputRef} // REF-attributet är tillbaka
                className="flex-1 h-full bg-transparent focus:ring-0 focus:outline-none text-base"
                value={input}
                placeholder={isLoading ? 'Tänker...' : 'Ställ en fråga...'}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                disabled={isLoading || !input || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        // ----- KOLLAPSAT LÄGE -----
        <div className="flex items-center space-x-3 h-full w-full rounded-lg px-4" onClick={() => setIsExpanded(true)}>
           <button type="button" className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full">
            <ChevronUp className="w-5 h-5" />
          </button>
          <div className="flex-1 h-full flex items-center text-text-secondary cursor-pointer">
            Ställ en fråga...
          </div>
        </div>
      )}
    </div>
  );
}
