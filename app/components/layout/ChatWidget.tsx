
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/app/contexts/ChatContext';
import ChatInput from '@/app/components/chat/ChatInput';
import MessageFeed from '@/app/components/chat/MessageFeed';

export default function ChatWidget() {
    // Hämta den korrekta sessionsdatan från context
    const { messages, isLoading, session, sendMessage, stop } = useChat();
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const chatWidget = document.getElementById('chat-widget');
            if (chatWidget && !chatWidget.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        }

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const handleSendMessage = (content: string, file?: File) => {
        // Vi behöver inte hantera fileUris här just nu, men behåller för framtiden
        sendMessage(content);
    };

    // KORREKT LOGIK: Chatten är avaktiverad om användaren inte är autentiserad.
    const isChatDisabled = session.status !== 'authenticated';

    return (
        <div id="chat-widget" className={`fixed bottom-0 left-0 md:left-64 right-0 z-40 transition-all duration-300 ease-in-out`}>
            <div className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-7xl flex flex-col shadow-2xl-top rounded-t-lg ${isExpanded ? 'h-[calc(100vh-5rem)]' : 'h-auto'}`}>
                
                {isExpanded && (
                     <div className="flex items-center justify-between p-3 border-b border-border-primary">
                        <h2 className="text-lg font-semibold text-center flex-1">ByggPilot</h2>
                        <button type="button" onClick={() => setIsExpanded(false)}><ChevronDownIcon className="h-6 w-6" /></button>
                    </div>
                )}

                {isExpanded && <MessageFeed messages={messages} />}

                <div className="p-3">
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isChatDisabled={isChatDisabled} // Skickar nu korrekt värde
                        onFocus={() => !isExpanded && setIsExpanded(true)}
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        isLoading={isLoading}
                        stop={stop}
                    />

                    <p className="text-xs text-gray-500 text-center mt-2">
                        AI-svar kan innehålla felaktigheter. Verifiera alltid kritisk information.
                    </p>
                </div>
            </div>
        </div>
    );
}
