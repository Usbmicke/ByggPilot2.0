
'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { XMarkIcon, PaperAirplaneIcon, StopCircleIcon } from '@heroicons/react/24/solid';

// =======================================================================
//  CHATT-KOMPONENT (VERSION 2.0 - INTEGRERAD BAR)
//  Designad för att vara en permanent del av UI:t, med hopfällt och
//  utfällt läge, precis som i visionen.
// =======================================================================

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Förhindra att klicket triggar onFocus på input igen
    setIsExpanded(false);
  };

  return (
    <div className="flex-shrink-0 bg-[#1C1C1E] border-t border-neutral-800/50 p-4">
        <div className={`mx-auto max-w-3xl transition-all duration-300 ease-in-out`}>

            {/* --- UTFÄLLT LÄGE: Visar hela chatten --- */}
            {isExpanded && (
                <div 
                    className="bg-[#111113] border border-neutral-700/80 rounded-t-xl shadow-2xl mb-4 animate-slide-up"
                    style={{ height: '65vh', display: 'flex', flexDirection: 'column' }}
                >
                    {/* Header för chattfönstret */}
                    <div className="flex justify-between items-center p-4 border-b border-neutral-800 flex-shrink-0">
                        <h3 className="font-bold text-lg text-gray-200">Fråga ByggPilot AI...</h3>
                        <button onClick={handleClose} className="p-1 hover:bg-neutral-700 rounded-full">
                            <XMarkIcon className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    {/* Chatthistorik */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <ChatMessages messages={messages} isLoading={isLoading} />
                    </div>
                </div>
            )}

            {/* --- ALLTID SYNLIG INPUT-BAR --- */}
            <form onSubmit={handleSubmit} className="relative">
                 <ChatInput
                    input={input}
                    handleInputChange={handleInputChange}
                    onFocus={handleFocus} // Fäller ut chatten vid fokus
                    isLoading={isLoading}
                    onStop={stop}
                    placeholder="Fråga ByggPilot AI, t.ex. 'Skapa ett nytt projekt för Brf. Eken'..."
                 />
            </form>
        </div>
    </div>
  );
}
