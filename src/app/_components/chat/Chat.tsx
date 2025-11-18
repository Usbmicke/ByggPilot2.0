'use client';

import React from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { ChevronDownIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

export default function Chat() {
  // Isolera useChat-hooken för att undvika destruktureringsproblem.
  const chat = useChat();
  const [isChatOpen, setIsChatOpen] = React.useState(true);

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-50"
        aria-label="Öppna chatt"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[70vh] max-h-[700px] bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-gray-200 flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-lg text-gray-800">ByggPilot Co-Pilot</h3>
        <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
            <ChevronDownIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
         <ChatMessages messages={chat.messages} isLoading={chat.isLoading} />
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={chat.handleSubmit}>
            <ChatInput
                input={chat.input}
                handleInputChange={chat.handleInputChange}
                isLoading={chat.isLoading}
                onStop={() => chat.stop() }
            />
        </form>
      </div>
    </div>
  );
}
