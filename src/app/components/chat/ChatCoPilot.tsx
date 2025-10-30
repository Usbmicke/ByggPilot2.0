'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatMessages } from './ChatMessages';
import { PaperClipIcon, ArrowUpIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';

export function ChatCoPilot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Dynamiska klasser för en mjuk höjd-animation
  const containerClasses = `
    relative transition-all duration-500 ease-in-out 
    bg-zinc-800/80 backdrop-blur-md border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/30
    flex flex-col overflow-hidden
    ${isChatOpen ? 'h-[60vh] max-h-[700px]' : 'h-20'}
  `;

  return (
    <div className={containerClasses}>

      {/* ---- HEADER / HOPFÄLLT LÄGE ---- */}
      {/* Denna sektion är alltid synlig. Den fungerar som både header och den hopfällda baren. */}
      <div 
        className={`flex items-center justify-between h-20 px-6 flex-shrink-0 ${isChatOpen ? '' : 'cursor-pointer'}`}
        onClick={!isChatOpen ? toggleChat : undefined}
      >
        <div className="flex items-center gap-4">
          <SparklesIcon className="h-6 w-6 text-cyan-400" />
          <span className="text-lg font-medium text-gray-200">Fråga ByggPilot AI</span>
        </div>
        <button onClick={toggleChat} className="p-2 rounded-full hover:bg-zinc-700/80 transition-colors">
          <XMarkIcon className={`h-6 w-6 text-gray-400 transition-transform duration-500 ${isChatOpen ? 'rotate-0' : '-rotate-180'}`} />
        </button>
      </div>

      {/* ---- MEDDELANDEYTA (ENDAST SYNLIG NÄR ÖPPEN) ---- */}
      {isChatOpen && (
        <div className="flex-1 overflow-y-auto px-6 pb-4">
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

      {/* ---- INPUT-FÄLT (ENDAST SYNLIG NÄR ÖPPEN) ---- */}
      {isChatOpen && (
        <div className="p-6 flex-shrink-0 bg-zinc-900/50 border-t border-zinc-700/80">
          <form onSubmit={handleSubmit} className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ställ en fråga till ByggPilot AI..."
              className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl pl-6 pr-16 py-4 text-base text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              disabled={isLoading || !input.trim()}
            >
              <ArrowUpIcon className="h-6 w-6 text-white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
