
'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ChatInput from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export function ChatCoPilot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  if (!isChatOpen) {
    return (
      <button 
        onClick={toggleChat} 
        className="fixed bottom-5 right-5 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-transform duration-200 ease-in-out transform hover:scale-110"
      >
        <ChevronDownIcon className="h-6 w-6 transform rotate-180" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-[400px] h-[600px] bg-background-primary border border-border-color rounded-lg shadow-xl flex flex-col z-50">
      <header className="flex items-center justify-between p-4 border-b border-border-color bg-background-secondary">
        <h2 className="text-lg font-semibold text-text-primary">ByggPilot AI</h2>
        <button onClick={toggleChat} className="p-2 rounded-full hover:bg-background-tertiary">
          <XMarkIcon className="h-6 w-6 text-text-primary" />
        </button>
      </header>
      
      <ChatMessages messages={messages} isLoading={isLoading} />

      <div className="p-4 border-t border-border-color">
        <ChatInput 
          input={input} 
          handleInputChange={handleInputChange} 
          handleSubmit={handleSubmit} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
