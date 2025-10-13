
'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/contexts/ChatContext';
import ChatInput from '@/components/chat/ChatInput';
import MessageFeed from '@/components/chat/MessageFeed';

// =================================================================================
// CHATBANNER V1.0 - NY IMPLEMENTERING
// BESKRIVNING: Denna komponent ersätter den gamla ChatWidget. Den är designad
// för att vara en fast banner i botten av <main> som expanderar uppåt.
// Den använder den centrala ChatContext och innehåller både MessageFeed och ChatInput.
// =================================================================================

export default function ChatBanner() {
    const { 
        messages, 
        isLoading, 
        sendMessage, 
        stop, 
        clearChat, 
        session 
    } = useChat();
    
    const [isExpanded, setIsExpanded] = useState(false);

    const isChatDisabled = session.status !== 'authenticated';

    // Om sessionen inte är autentiserad, rendera ingenting.
    if (isChatDisabled) {
        return null;
    }

    return (
        <div id="chat-banner-container" className={`sticky bottom-0 left-0 right-0 mt-8 z-10`}>
            <div className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-4xl flex flex-col shadow-2xl-top rounded-t-lg`}>
                
                {/* -- EXPANDERAT LÄGE -- */}
                {isExpanded && (
                     <div className="flex items-center justify-between p-3 border-b border-border-primary">
                        <h2 className="text-lg font-semibold text-center flex-1">ByggPilot Assistent</h2>
                        <button type="button" onClick={() => setIsExpanded(false)} className="p-1 hover:bg-border-primary rounded-full">
                            <ChevronDownIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}

                {isExpanded && (
                    <div className="h-[450px]">
                        <MessageFeed messages={messages} />
                    </div>
                )}

                {/* -- ALLTID SYNLIG INPUT-SEKTION -- */}
                <div className="p-3">
                    <ChatInput 
                        onSendMessage={sendMessage}
                        isChatDisabled={isChatDisabled}
                        onFocus={() => !isExpanded && setIsExpanded(true)} // Expandera vid fokus
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        isLoading={isLoading}
                        stop={stop}
                        clearChat={clearChat}
                    />

                    {!isExpanded && (
                         <p className="text-xs text-gray-500 text-center mt-2">
                            Du kan fråga mig vad som helst. Prova: "Skapa ett nytt projekt för Kalles Bygg på Storgatan 1".
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
