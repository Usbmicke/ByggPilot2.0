
'use client';

import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, FormEvent } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; // Changed to HTMLTextAreaElement
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void; // Added onStop for stopping generation
}

// A basic textarea that grows with content, up to a certain limit.
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
    />
  );
};

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading, onStop }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="relative">
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
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-500 text-white disabled:bg-gray-400 hover:bg-primary-600 transition-colors"
            disabled={!input.trim()}
            aria-label="Skicka meddelande"
        >
            <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}
