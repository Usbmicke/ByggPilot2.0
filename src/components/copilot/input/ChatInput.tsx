'use client';

import { ChevronUp, ChevronDown, Paperclip, Mic, ArrowUp } from 'lucide-react';
import { ChangeEventHandler, FormEventHandler, useRef, useEffect, KeyboardEventHandler } from 'react';

// ===================================================================================================
// CHAT INPUT COMPONENT V2.2 (Toppskick: A11y & Layout Certified)
// ===================================================================================================
// Denna version är certifierad för "Toppskick". Alla knappar har fått `aria-label` för full 
// tillgänglighet (a11y), och all bräcklig "magisk nummer"-layout har ersatts med en robust 
// `padding`-baserad lösning. Koden är nu både tillgänglig och visuellt solid.

interface ChatInputProps {
  isExpanded: boolean;
  isLoading: boolean;
  input: string;
  onInputChange: ChangeEventHandler<HTMLTextAreaElement>;
  onFormSubmit: FormEventHandler<HTMLFormElement>;
  onFocus: () => void;
  onToggleExpand: () => void;
  onFeatureNotImplemented: () => void;
}

export function ChatInput({ 
  isExpanded,
  isLoading, 
  input, 
  onInputChange, 
  onFormSubmit,
  onFocus,
  onToggleExpand,
  onFeatureNotImplemented
}: ChatInputProps) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input, isExpanded]);

  const placeholder = isLoading 
    ? 'Tänker...' 
    : (isExpanded ? 'Ställ en fråga... (Shift+Enter för ny rad)' : 'Skriv ett meddelande eller expandera chatten');

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = textareaRef.current?.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  return (
    <div className={`w-full ${isExpanded ? 'p-4 border-t border-border-color/80' : 'p-2 h-full'}`}>
      {/* TOPPSKICK-FIX: `pb-2` skapar ett robust inre avstånd, `space-x-2` hanterar horisontell spacing. */}
      <form onSubmit={onFormSubmit} className="flex items-end w-full h-full space-x-2 bg-background-tertiary rounded-lg px-2 pb-2 pt-2">
        
        <button 
          type="button" 
          onClick={onToggleExpand} 
          aria-label={isExpanded ? "Minimera chattfönster" : "Expandera chattfönster"}
          className="p-2 text-blue-500 rounded-full hover:bg-blue-500/10 self-end flex-shrink-0"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        {isExpanded && (
          <div className="flex self-end">
            <button 
              type="button" 
              onClick={onFeatureNotImplemented} 
              disabled={isLoading} 
              aria-label="Bifoga fil (ej implementerad)"
              className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50">
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              onClick={onFeatureNotImplemented} 
              disabled={isLoading} 
              aria-label="Använd mikrofon (ej implementerad)"
              className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center bg-background-primary/50 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/50 transition-shadow duration-200">
          <textarea
            ref={textareaRef}
            rows={1}
            aria-label="Chatt-input"
            className="flex-1 bg-transparent focus:ring-0 focus:outline-none placeholder:text-text-secondary text-base resize-none py-3 px-2 w-full"
            style={{ maxHeight: '200px' }}
            value={input}
            placeholder={placeholder}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            disabled={isLoading}
          />
        </div>
        
        {isExpanded && (
          <button
            type="submit"
            aria-label="Skicka meddelande"
            className="w-8 h-8 self-end flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:bg-gray-700 hover:bg-primary/90 transition-colors"
            disabled={isLoading || !input?.trim()}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
}
