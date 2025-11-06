'use client';

import { useChat } from '@ai-sdk/react';
import { logger } from '@/lib/logger';
import { useState, useRef, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { ChevronUp, ChevronDown, X, Paperclip, Mic, ArrowUp, AlertTriangle } from 'lucide-react';

// ===================================================================================================
// CHAT COMPONENT V11.0 - Blueprint "Polished Professionalism": Design, Detaljer & Finess
// ===================================================================================================
// Denna slutgiltiga version implementerar en professionell visuell uppgradering med fokus på detaljer,
// färgaccenter och ett otvetydigt gränssnitt, helt i enlighet med användarens specifikationer.

export default function Chat() {
  const { mutate } = useSWRConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

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

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop } = useChat({
    api: '/api/chat',
    onError: (err) => {
        logger.error('[useChat Hook]', err);
        setChatError('Ett fel inträffade. Chatten är tillfälligt otillgänglig.');
    },
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

  const handleFeatureNotImplemented = () => {
      alert('Denna funktion är inte implementerad än.');
  };
  
  const resetChat = () => {
      stop();
      setMessages([]);
      setChatError(null);
  };

  // DESIGNFIX: Lägger till en subtil blå inramning när chatten är expanderad.
  const commonContainerClasses = `fixed z-50 transition-all duration-500 ease-in-out border`;
  const collapsedClasses = `left-80 right-8 bottom-5 h-16 rounded-xl bg-background-secondary shadow-2xl border-border-color/80`;
  const expandedClasses = `top-16 left-72 right-0 bottom-0 rounded-t-xl bg-background-secondary/90 backdrop-blur-md border-blue-500/30`;

  return (
    <div className={`${commonContainerClasses} ${isExpanded ? expandedClasses : collapsedClasses}`}>
      <div className={`flex items-center justify-between h-16 px-4 border-b border-border-color/80 ${isExpanded ? '' : 'hidden'}`}>
        <h2 className="text-lg font-bold">ByggPilot Co-Pilot</h2>
        <div>
            <button onClick={resetChat} className="p-2 rounded-full hover:bg-background-tertiary mr-2">
                <small>Rensa</small>
            </button>
            <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-background-tertiary">
              <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? '' : 'hidden'}`}
        style={{ height: isExpanded ? 'calc(100% - 128px)' : '0' }}
      >
        {chatError && (
            <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold">Ett fel uppstod</h4>
                    <p className="text-sm">{chatError}</p>
                </div>
            </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`whitespace-pre-wrap flex flex-col items-${m.role === 'user' ? 'end' : 'start'}`}>
            <div className={`p-3 rounded-lg max-w-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background-tertiary'}`}>
              <span className="font-bold capitalize">{m.role === 'assistant' ? 'ByggPilot' : 'Du:'}</span>
              <p>{m.content}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && !chatError && isExpanded && (
          <div className="text-center text-text-secondary p-8">
            <p>Chatthistorik kommer att visas här. Börja med att ställa en fråga nedan.</p>
          </div>
        )}
      </div>

      <div className={`w-full ${isExpanded ? 'p-4 border-t border-border-color/80' : 'p-2 h-full'}`}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 h-full w-full bg-background-tertiary rounded-lg px-4">
          
          {/* DESIGNFIX: Knappen har nu en blå accentfärg och tydlig hover-effekt. */}
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <button type="button" onClick={handleFeatureNotImplemented} disabled={isLoading || !!chatError} className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" onClick={handleFeatureNotImplemented} disabled={isLoading || !!chatError} className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50">
            <Mic className="w-5 h-5" />
          </button>
          
          <input
            ref={inputRef}
            className="flex-1 h-full bg-transparent focus:ring-0 focus:outline-none placeholder:text-text-secondary text-base"
            value={input}
            placeholder={isLoading ? 'Tänker...' : (isExpanded ? 'Ställ en fråga...' : placeholder)}
            onChange={handleInputChange}
            onFocus={() => { if (!isExpanded) setIsExpanded(true); }}
            disabled={isLoading || !!chatError}
          />
          
          {/* DESIGNFIX: En ren, dedikerad "Skicka"-knapp som bara visas när den behövs. */}
          {isExpanded && (
            <button
              type="submit"
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:bg-gray-500 hover:bg-primary/90"
              disabled={isLoading || !input?.trim() || !!chatError}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
