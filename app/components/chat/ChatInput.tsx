
'use client';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

const ChatInput = () => {
  const [prompt, setPrompt] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    // Här kommer logiken för att skicka meddelandet
    console.log('Skickar meddelande:', prompt);
    setPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={prompt}
        onChange={handleInputChange}
        placeholder="Ge mig en checklista..."
        className="w-full bg-background-primary border border-border-primary rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-colors duration-200 text-text-primary"
      />
      <button 
        type="submit"
        disabled={!prompt.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-accent-blue text-white disabled:bg-background-tertiary disabled:text-text-secondary transition-colors duration-200"
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
