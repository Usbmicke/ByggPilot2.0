'use client';

import { Paperclip, Mic, ArrowUp } from 'lucide-react';
import { ChangeEventHandler, FormEventHandler, useRef, useEffect, KeyboardEventHandler } from 'react';

// ===================================================================================================
// CHAT INPUT COMPONENT V3.1 (Blueprint: "Logisk Chatt med Toppskick-Design")
// ===================================================================================================
// FIX V3.1: Korrigerar den felaktiga `disabled`-logiken på Skicka-knappen. Knappen ska
// endast vara inaktiverad om textfältet är tomt, inte baserat på `isLoading`.

interface ChatInputProps {
  isLoading: boolean;
  input: string;
  onInputChange: ChangeEventHandler<HTMLTextAreaElement>;
  onFormSubmit: FormEventHandler<HTMLFormElement>;
  onFeatureNotImplemented: () => void;
}

export function ChatInput({ 
  isLoading, 
  input, 
  onInputChange, 
  onFormSubmit,
  onFeatureNotImplemented
}: ChatInputProps) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamiskt expanderande textfält.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const placeholder = isLoading ? 'Tänker...' : 'Ställ en fråga... (Shift+Enter för ny rad)';

  // Hanterar "Enter" för att skicka.
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
    <div className="p-4 border-t border-border-color/80">
      <form onSubmit={onFormSubmit} className="flex items-end w-full space-x-2 bg-background-tertiary rounded-lg px-2 pb-2 pt-2">
        
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
            disabled={isLoading}
            autoFocus // Sätter fokus automatiskt när chatten expanderas.
          />
        </div>
        
        <button
          type="submit"
          aria-label="Skicka meddelande"
          className="w-8 h-8 self-end flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:bg-gray-700 hover:bg-primary/90 transition-colors"
          disabled={!input?.trim()}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
