
'use client';

import { PaperAirplaneIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, FocusEventHandler } from 'react';

// GULDSTANDARD v5.0: Props förenklade för manuell hantering.
// Onödig komplexitet borttagen.
interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onFocus: FocusEventHandler<HTMLInputElement>;
  onStop: () => void;
  placeholder: string;
}

export default function ChatInput({
  input,
  handleInputChange,
  isLoading,
  onFocus,
  onStop,
  placeholder,
}: ChatInputProps) {

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={onFocus}
        disabled={isLoading}
        placeholder={isLoading ? "Tänker..." : placeholder}
        className="w-full bg-[#3A3A3C] text-gray-200 border-none rounded-full py-3 pl-5 pr-20 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow duration-200"
        autoComplete="off"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="p-2 text-gray-400 hover:text-white"
            aria-label="Stoppa generering"
          >
            <StopCircleIcon className="h-7 w-7" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 text-gray-400 disabled:text-gray-600 enabled:hover:text-white enabled:text-indigo-400 transition-colors"
            aria-label="Skicka meddelande"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
