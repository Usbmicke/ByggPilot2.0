'use client';

import { useChat } from '@ai-sdk/react';
import { logger } from '@/lib/logger';
import { useState, useRef, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { ChevronUp, ChevronDown, X, Paperclip, Mic, ArrowUp, AlertTriangle } from 'lucide-react';

// ===================================================================================================
//h CHAT COMPONENT V14.0 - Blueprint "Canary Test": Verifierar anslutning.
// ===================================================================================================
// Detta är ett diagnostiskt test. Den enda ändringen är att ersätta platshållartexten med
// en statisk sträng för att verifiera att ändringar i denna fil faktiskt når fram till webbläsaren.

export default function Chat() {
  const { mutate } = useSWRConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // KANARIETEST: Byt ut dynamisk platshållare mot en statisk sträng.
  const placeholder = "SER DU DENNA TEXT?";

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
              <ChevronDown className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? '' : 'hidden'}`}
        style={{ height: isExpanded ? 'calc(100% - 128px)' : '0' }}
      >
        {/* ... (oförändrad) ... */}
      </div>

      <div className={`w-full ${isExpanded ? 'p-4 border-t border-border-color/80' : 'p-2 h-full'}`}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 h-full w-full bg-background-tertiary rounded-lg px-4">

          {!isExpanded ? (
            <button 
              type="button" 
              onClick={() => setIsExpanded(true)} 
              className="p-2 w-full h-full flex items-center justify-start text-blue-500"
            >
              <ChevronUp className="w-5 h-5 flex-shrink-0 mr-3" />
              <span className="text-text-secondary">{placeholder}</span>
            </button>
          ) : (
            <>
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
                placeholder={isLoading ? 'Tänker...' : 'Ställ en fråga...'}
                onChange={handleInputChange}
                disabled={isLoading || !!chatError}
              />
              
              <button
                type="submit"
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:bg-gray-500 hover:bg-primary/90"
                disabled={isLoading || !input?.trim() || !!chatError}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
