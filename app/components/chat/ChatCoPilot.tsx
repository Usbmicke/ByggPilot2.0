
'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// FAS 2: Bygger den nya, persistenta chatt-komponenten
export function ChatCoPilot() {
    const [isExpanded, setIsExpanded] = useState(false);

    // FAS 2: Kopplar UI mot den nya backend-orkestreraren med useChat
    const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
        api: '/api/chat',
    });

    // Om den inte är expanderad, visa bara den minimerade baren
    if (!isExpanded) {
        return (
            <div 
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-5 right-5 lg:bottom-10 lg:right-10 z-50 bg-background-secondary rounded-lg p-4 shadow-2xl cursor-pointer hover:bg-gray-700 transition-colors w-11/12 max-w-md lg:w-auto"
            >
                <div className="flex items-center justify-between">
                    <p className="font-medium text-text-primary">Fråga ByggPilot AI...</p>
                    {/* Ikoner, etc. kan läggas till här */}
                </div>
            </div>
        );
    }

    // Om den är expanderad, visa hela chatt-fönstret
    return (
        <div className="fixed bottom-0 right-0 lg:bottom-10 lg:right-10 z-50 w-full h-full lg:h-auto lg:max-h-[80vh] lg:w-[500px] bg-background-secondary shadow-2xl rounded-t-lg lg:rounded-lg flex flex-col">
            {/* Header för chatt-fönstret */}
            <div className="flex justify-between items-center p-4 border-b border-border-primary bg-background-tertiary rounded-t-lg">
                <h2 className="font-bold text-lg text-text-primary">ByggPilot AI</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white">
                        <ChevronDownIcon className="h-6 w-6" />
                    </button>
                    <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Meddelande-lista */}
            <div className="flex-1 overflow-y-auto p-4">
                 <ChatMessages messages={messages} isLoading={isLoading} />
            </div>

            {/* Input-fält */}
            <div className="p-4 border-t border-border-primary">
                <form onSubmit={handleSubmit}>
                    <ChatInput 
                        isChatDisabled={false} // För nu, alltid aktiverad
                        isLoading={isLoading}
                        stop={stop}
                        onSendMessage={() => {}} // Hanteras av useChat's handleSubmit
                        onFocus={() => {}}
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        value={input} // Bunden till useChat-hooken
                        onChange={handleInputChange} // Bunden till useChat-hooken
                    />
                </form>
            </div>
        </div>
    );
}
