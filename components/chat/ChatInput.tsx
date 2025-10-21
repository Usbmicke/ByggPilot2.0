
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef } from 'react';
import { cn } from '@/lib/utils';

// =================================================================================
// CHAT INPUT (v2.0 - "HEADLESS" DESIGN)
// Beskrivning: Avskalad version som saknar egna bakgrunder eller kantlinjer.
//              Ärver nu 100% av sin stil från förälder-komponenten (`AIChat`).
// v2.0:
//    - Rensat bort `bg-*`, `border-*`, och `p-*` klasser.
//    - Design är nu helt styrd av föräldern för enhetlighet.
// =================================================================================

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const safeInput = input || '';

  return (
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={safeInput}
          onChange={handleInputChange}
          placeholder="Fråga ByggPilot AI..."
          className={cn(
            // Avskalad design: transparent bakgrund, ärver färg.
            'flex-1 resize-none bg-transparent text-gray-200 placeholder-gray-400 border border-gray-600 rounded-2xl py-3 px-4 shadow-inner',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-background',
            'min-h-[52px] max-h-[200px] pr-28' 
          )}
          disabled={isLoading}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading && safeInput.trim()) {
                // Anropar formulärets submit-funktion
                (e.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
              }
            }
          }}
          onInput={() => {
            // Auto-resize logik, oförändrad
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              const scrollHeight = textareaRef.current.scrollHeight;
              textareaRef.current.style.height = `${scrollHeight}px`;
            }
          }}
        />
        
        <div className="absolute bottom-2 right-3 flex items-center gap-1">
          <Button variant="ghost" size="icon" type="button" className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" disabled={isLoading}>
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Bifoga fil</span>
          </Button>

          <Button variant="ghost" size="icon" type="button" className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" disabled={isLoading}>
            <Mic className="h-5 w-5" />
            <span className="sr-only">Spela in ljud</span>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || !safeInput.trim()}
            size="icon"
            className={cn(
              'rounded-full w-9 h-9 transition-colors duration-200',
              safeInput.trim() ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Skicka meddelande</span>
          </Button>
        </div>
      </form>
  );
}
