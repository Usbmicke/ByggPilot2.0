
'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/app/contexts/ChatContext';
import ChatInput from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { SparklesIcon } from '@heroicons/react/24/solid';

// Detta är den nya "hjärn"-komponenten som binder samman allt.
export function Chat() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // En simulerad isLoading-state för att designen ska se korrekt ut.
  // I en verklig app skulle detta komma från din useChat-hook.
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    await sendMessage(input);
    setInput('');
    setIsLoading(false);
  };

  // Dynamiska klasser för den yttre behållaren, styrd av isExpanded
  const containerClasses = `
    relative transition-all duration-500 ease-in-out
    flex flex-col overflow-hidden
    ${isExpanded ? 'h-[60vh] max-h-[700px] bg-zinc-900/80 backdrop-blur-md border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/30' : 'h-auto'}
  `;

  return (
    <div className={containerClasses}>
      {/* ---- MEDDELANDEYTA (ENDAST SYNLIG NÄR EXPANDERAD) ---- */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <SparklesIcon className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-300">Börja din konversation</h3>
              <p className="text-gray-500 max-w-xs mt-1">Jag kan hjälpa dig med allt från projektplanering till att generera rapporter.</p>
            </div>
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>
      )}

      {/* ---- INPUT-SEKTION (ALLTID SYNLIG) ---- */}
      <div className={`flex-shrink-0 p-1 ${isExpanded ? 'bg-zinc-800/50 border-t border-zinc-700/80' : ''}`}>
        <ChatInput 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          isChatDisabled={false} // Antar att användaren är inloggad
          onFocus={() => setIsExpanded(true)}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isLoading={isLoading}
          stop={() => setIsLoading(false)} // Simulerad stoppfunktion
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
}
