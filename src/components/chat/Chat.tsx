
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { ChevronDownIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

// =================================================================================
// NYA CHAT-KOMPONENTEN (FAS 2 - Stabil & Ren)
// =================================================================================

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Använder Vercel AI SDK:s useChat-hook
  // Denna hook hanterar all state management för chatten (meddelanden, input, etc.)
  // Den anropar automatiskt vår nya API-endpoint.
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat', // Bryggan till vårt Genkit-flöde
  });

  // Knappen som visas när chatten är minimerad
  if (!isChatOpen) {
    return (
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-transform hover:scale-110 z-50 animate-fadeIn"
        aria-label="Öppna chatt"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
    )
  }

  // Hela chattfönstret
  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[70vh] max-h-[700px] bg-background-primary shadow-2xl rounded-2xl border border-border-color flex flex-col z-50 animate-slideInUp">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
        <h3 className="font-bold text-lg">ByggPilot Co-Pilot</h3>
        <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-background-secondary rounded-full">
            <ChevronDownIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Meddelanden (scrollbart) */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
      
      {/* Input-fält */}
      <div className="p-4 border-t border-border-color flex-shrink-0">
        <ChatInput 
            input={input} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading} 
            onStop={stop} // Passar stop-funktionen till input-komponenten
        />
      </div>
    </div>
  );
}
