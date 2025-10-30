
'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatMessages } from './ChatMessages';
import { PaperClipIcon, ArrowUpIcon, XMarkIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export function ChatCoPilot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Hopfällt läge: Ett fält längst ner på sidan
  if (!isChatOpen) {
    return (
        <div 
            className="absolute bottom-0 left-0 right-0 z-40 bg-background-secondary border-t border-border-color shadow-2xl-top"
            onClick={toggleChat}
        >
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center h-20 cursor-pointer group">
                    <div className="flex-1 flex items-center">
                        <PaperClipIcon className="h-6 w-6 text-gray-500 mr-4" />
                        <p className="text-gray-400 text-lg">Fråga ByggPilot AI...</p>
                    </div>
                    <button className="p-3 bg-gray-700 rounded-lg group-hover:bg-primary-600 transition-colors">
                        <ChevronUpIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
            </div>
      </div>
    );
  }

  // Utfällt läge: En fullhöjds chattpanel
  return (
    <div className="absolute top-16 bottom-0 left-0 right-0 bg-background-primary flex flex-col z-50 shadow-2xl-top border-t border-border-color">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        {/* Header för den utfällda chatten */}
        <header className="flex items-center justify-between p-4 border-b border-border-color bg-background-secondary flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Fråga ByggPilot AI</h2>
          <button onClick={toggleChat} className="p-2 rounded-md hover:bg-background-tertiary">
            <XMarkIcon className="h-6 w-6 text-text-primary" />
          </button>
        </header>
        
        {/* Meddelandeyta */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Chatthistorik kommer att visas här</p>
            </div>
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>

        {/* Input-fältet längst ner */}
        <div className="p-6 bg-background-secondary border-t border-border-color flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <PaperClipIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Fråga ByggPilot AI..."
              className="w-full bg-background-primary border-2 border-border-color rounded-lg pl-12 pr-20 py-3.5 text-lg focus:ring-primary-500 focus:border-primary-500 transition-shadow"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || !input.trim()}
            >
              <ArrowUpIcon className="h-6 w-6 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
