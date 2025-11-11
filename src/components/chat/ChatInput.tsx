
'use client';

import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, KeyboardEvent } from 'react';

// New, simplified props
interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  onStop: () => void;
}

// The Textarea component remains the same
const ExpandingTextarea = ({ input, handleInputChange, isLoading }: Pick<ChatInputProps, 'input' | 'handleInputChange' | 'isLoading'>) => {
  return (
    <textarea
      value={input}
      onChange={handleInputChange}
      placeholder={isLoading ? 'Tänker...' : 'Ställ en fråga till din co-pilot...'}
      className="w-full bg-background-secondary rounded-lg py-3 pl-4 pr-12 border border-border-color focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow resize-none"
      disabled={isLoading}
      rows={1}
      maxLength={2000}
      onInput={(e) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }}
      // Optional: Submit on Enter, new line on Shift+Enter
      onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          // The form submission is handled by the parent component (Chat.tsx)
          // We find the form and request a submission.
          const form = e.currentTarget.closest('form');
          form?.requestSubmit();
        }
      }}
    />
  );
};

// The main component no longer has a form element
export default function ChatInput({ input, handleInputChange, isLoading, onStop }: ChatInputProps) {
  return (
    <div className="relative">
        <ExpandingTextarea 
            input={input}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
        />
      
      {isLoading ? (
        <button 
            type="button" 
            onClick={onStop}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
            aria-label="Stoppa generering"
        >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"></path></svg>
        </button>
      ) : (
        <button 
            type="submit" // This button now submits the parent form in Chat.tsx
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-500 text-white disabled:bg-gray-400 hover:bg-primary-600 transition-colors"
            disabled={!input.trim()}
            aria-label="Skicka meddelande"
        >
            <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
