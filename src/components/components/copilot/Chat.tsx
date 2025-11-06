'use client';

import { useChat } from '@ai-sdk/react';
import { logger } from '@/lib/logger';
import { useState, useRef, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { ChevronUp, X, Paperclip, Mic, ArrowUp } from 'lucide-react';

// =================================================================================
// CHAT COMPONENT V5.0 - Blueprint "Sektion 5.6": Fullfjädrad Input & Polerad Design
// =================================================================================
// Den slutgiltiga versionen. Implementerar en fullständig, modern chatt-input i både
// hopfällt och expanderat läge, med ikoner för bifoga fil och ljudinput. Designen är
// polerad och alla element är perfekt centrerade och stylade.

export default function Chat() {
  const { mutate } = useSWRConfig();
  const [isExpanded, setIsExpanded] = useState(false);

  const placeholderSuggestions = [
    'Skapa en checklista för badrumsrenovering',
    'Vilka projekt har snart deadline?',
    'Hjälp mig göra en egenkontroll för...',
    'Sammanfatta den senaste tidrapporteringen',
    'Skapa ett utkast för en ny offert'
  ];
  const [placeholder, setPlaceholder] = useState(placeholderSuggestions[0]);

  useEffect(() => {
    if (isExpanded) return;
    const interval = setInterval(() => {
      setPlaceholder(prev => placeholderSuggestions[(placeholderSuggestions.indexOf(prev) + 1) % placeholderSuggestions.length]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  const { messages, input, handleInputChange, handleSubmit, error, isLoading } = useChat({
    api: '/api/chat',
    onError: (err) => logger.error('[useChat Hook]', err),
    onFinish: (message) => {
      if (message.toolInvocations?.some(tool => tool.toolName === 'createProject')) {
        mutate('/api/projects');
      }
    }
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  const commonContainerClasses = `fixed z-50 transition-all duration-500 ease-in-out border border-border-color/80`;
  const collapsedClasses = `left-80 right-8 bottom-5 h-16 rounded-xl bg-background-secondary shadow-2xl`;
  const expandedClasses = `top-16 left-72 right-0 bottom-0 rounded-t-xl bg-background-secondary/90 backdrop-blur-md`;

  const expandChat = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!isExpanded) setIsExpanded(true);
  };

  return (
    <div className={`${commonContainerClasses} ${isExpanded ? expandedClasses : collapsedClasses}`}>
      {/* ---- EXPANDERAD HEADER ---- */}
      <div className={`flex items-center justify-between h-16 px-4 border-b border-border-color/80 ${isExpanded ? '' : 'hidden'}`}>
        <h2 className="text-lg font-bold">ByggPilot Co-Pilot</h2>
        <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-background-tertiary">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ---- CHATT-INNEHÅLL (Endast synligt när expanderad) ---- */}
      <div
        ref={chatContainerRef}
        className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? '' : 'hidden'}`}
        style={{ height: isExpanded ? 'calc(100% - 128px)' : '0' }}
      >
        {messages.map(m => (
          <div key={m.id} className={`whitespace-pre-wrap flex flex-col items-${m.role === 'user' ? 'end' : 'start'}`}>
            <div className={`p-3 rounded-lg max-w-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background-tertiary'}`}>
              <span className="font-bold capitalize">{m.role === 'assistant' ? 'ByggPilot' : 'Du:'}</span>
              <p>{m.content}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && isExpanded && (
          <div className="text-center text-text-secondary p-8">
            <p>Chatthistorik kommer att visas här.</p>
          </div>
        )}
      </div>

      {/* ---- UNIVERSAL, POLERAD INPUT ---- */}
      <div className={`w-full ${isExpanded ? 'p-4 border-t border-border-color/80' : 'p-2 h-full'}`}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 h-full w-full bg-background-tertiary rounded-lg px-4">
          <button type="button" className="p-2 text-text-secondary hover:text-text-primary">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-text-secondary hover:text-text-primary">
            <Mic className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            className="flex-1 h-full bg-transparent focus:ring-0 focus:outline-none placeholder:text-text-secondary text-base"
            value={input}
            placeholder={isLoading ? 'Tänker...' : (isExpanded ? 'Ställ en fråga...' : placeholder)}
            onChange={handleInputChange}
            onFocus={() => expandChat()}
            disabled={isLoading}
          />
          <button
            type={isExpanded ? 'submit' : 'button'}
            onClick={expandChat}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:bg-gray-500"
            disabled={isExpanded && (isLoading || !input)}
          >
            {isExpanded ? <ArrowUp className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
