'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useChatContext } from '@/contexts/ChatContext'; // KORRIGERING: Importera rätt hook
import ChatInput from '@/components/chat/ChatInput';
import MessageFeed from '@/components/chat/MessageFeed';

export default function ChatWidget() {
    // KORRIGERING: Använd rätt hook. `clearChat` och `session` hanteras annorlunda nu.
    const { messages, isLoading, sendMessage, stop } = useChatContext(); 
    const [isExpanded, setIsExpanded] = useState(false);

    // Sessionstatus hanteras nu av ChatProvider, så den direkta session-prop är inte längre nödvändig här.

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

    const handleSendMessage = (content: string) => {
        // `sendMessage` från `useChatContext` tar bara ett event, inte content/file direkt.
        // Detta måste hanteras av input-komponenten och `useChat`'s inbyggda state.
        // Denna funktion förenklas eftersom ChatInput nu använder context-värden direkt.
    };
    
    // isChatDisabled kan också tas från context om det behövs, eller härledas från isLoading.
    const isChatDisabled = isLoading;

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
                    {/* ChatInput behöver nu dra sina props från context istället för att få dem skickade. */}
                    <ChatInput 
                        isChatDisabled={isChatDisabled}
                        onFocus={() => !isExpanded && setIsExpanded(true)}
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                    />

                    <p className="text-xs text-gray-500 text-center mt-2">
                        AI-svar kan innehålla felaktigheter. Verifiera alltid kritisk information.
                    </p>
                </div>
            </div>
        </div>
    );
}