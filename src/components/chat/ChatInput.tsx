
'use client';

import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, KeyboardEvent, useState, useEffect } from 'react';

// Simplified props, as the input state is now managed locally.
interface ChatInputProps {
  isLoading: boolean;
  onStop: () => void;
  // handleInputChange is still needed to sync the state with the useChat hook.
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement> | { target: { name: string, value: string } }) => void;
}

const ExpandingTextarea = ({ value, handleChange, isLoading }: {
  value: string;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}) => {
  return (
    <textarea
      name="message" // Crucial for useChat to identify the input
      value={value}
      onChange={handleChange}
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
      onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const form = e.currentTarget.closest('form');
          form?.requestSubmit();
        }
      }}
    />
  );
};

export default function ChatInput({ isLoading, onStop, handleInputChange }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Manually call the hook's handler to keep it in sync.
    handleInputChange(e);
  }

  // Clear local input when the parent form is submitted (isLoading becomes true and then false)
  useEffect(() => {
    if (!isLoading) {
      setInputValue('');
    }
  }, [isLoading]);

  return (
    <div className="relative">
        <ExpandingTextarea 
            value={inputValue}
            handleChange={handleChange}
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
            disabled={!inputValue.trim()}
            aria-label="Skicka meddelande"
        >
            <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
