
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef } from 'react';

interface ChatInputWrapperProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInputWrapper({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputWrapperProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="p-4 bg-transparent border-t border-border/60">
      <form
        onSubmit={handleSubmit}
        className="relative"
      >
        {/* Text Area med fokus-styling */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Beskriv vad du vill göra eller fråga..."
          className="pr-28 min-h-[48px] bg-transparent resize-none rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-all"
          disabled={isLoading}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
            }
          }}
          onInput={() => {
            // Auto-resize textarea height
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
          }}
        />
        
        {/* Knappar positionerade absolut inuti formuläret för ett snyggare utseende */}
        <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1">
            {/* Bifoga-fil-knapp */}
            <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground" disabled={isLoading}>
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Bifoga fil</span>
            </Button>

            {/* Spela-in-ljud-knapp */}
            <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground" disabled={isLoading}>
                <Mic className="h-5 w-5" />
                <span className="sr-only">Spela in ljud</span>
            </Button>

            {/* Skicka-knapp */}
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="rounded-lg w-9 h-9 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted-foreground"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Skicka meddelande</span>
            </Button>
        </div>
      </form>
    </div>
  );
}
