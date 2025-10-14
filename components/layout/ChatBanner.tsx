
'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/contexts/ChatContext';
import ChatInput from '@/components/chat/ChatInput'; // Importerar den nya, context-drivna ChatInput
import MessageFeed from '@/components/chat/MessageFeed';

// GULDSTANDARD V2.0 - FÖRENKLAD
// BESKRIVNING: ChatBanner är nu uppdaterad för att fungera med den nya, 
// context-drivna ChatInput. Alla onödiga props (`onSendMessage`, `isLoading`, etc.) 
// har tagits bort från anropet till <ChatInput />, eftersom ChatInput nu hanterar 
// sin egen state via useChat(). Detta resulterar i en renare och mer 
// underhållsvänlig komponent.

export default function ChatBanner() {
    const { messages, session } = useChat();
    const [isExpanded, setIsExpanded] = useState(false);

    const isChatDisabled = session.status !== 'authenticated';

    if (isChatDisabled) {
        return null;
    }

    const handleInputFocus = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }
    };

    return (
        <div id="chat-banner-container" className={`sticky bottom-0 left-0 right-0 mt-8 z-10`}>
            <div className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-4xl flex flex-col shadow-2xl-top rounded-t-lg`}>
                
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

                {/* RENARE INPUT-SEKTION */}
                <div className="p-3" onClick={handleInputFocus}> 
                    {/* Inga fler onödiga props skickas till ChatInput */}
                    <ChatInput />

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
