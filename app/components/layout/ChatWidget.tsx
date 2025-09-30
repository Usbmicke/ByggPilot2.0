
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/app/contexts/ChatContext';
import ChatInput from '@/app/components/chat/ChatInput';
import MessageList from '@/app/components/chat/MessageList';
import ChatTabs from '@/app/components/chat/ChatTabs';

export default function ChatWidget() {
    const { messages, isLoading, firebaseUser, sendMessage } = useChat();
    const [isExpanded, setIsExpanded] = useState(false);

    // Effekt för att hantera `isExpanded` state när man klickar utanför.
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
        sendMessage(content, file);
    };

    const isChatDisabled = !firebaseUser;

    return (
        <div id="chat-widget" className={`fixed bottom-0 left-0 md:left-64 right-0 z-40 transition-all duration-300 ease-in-out`}>
            <div className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-7xl flex flex-col shadow-2xl-top rounded-t-lg ${isExpanded ? 'h-[calc(100vh-5rem)]' : 'h-auto'}`}>
                
                {/* Header och stäng-knapp (visas bara när chatten är expanderad) */}
                {isExpanded && (
                     <div className="flex items-center justify-between p-3 border-b border-border-primary">
                        <ChatTabs />
                        <h2 className="text-lg font-semibold text-center">ByggPilot</h2>
                        <button type="button" onClick={() => setIsExpanded(false)}><ChevronDownIcon className="h-6 w-6" /></button>
                    </div>
                )}

                {/* Meddelandelista (visas bara när chatten är expanderad) */}
                {isExpanded && <MessageList messages={messages} isLoading={isLoading} />}

                {/* Alltid synlig botten-sektion med input-fältet */}
                <div className="p-3">
                     {/* Upp-pil för att expandera (visas bara när chatten är minimerad) */}
                    {!isExpanded && (
                        <div className="flex justify-center mb-2">
                            <button type="button" onClick={() => setIsExpanded(true)} className="p-2"><ChevronUpIcon className="h-6 w-6" /></button>
                        </div>
                    )}

                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isChatDisabled={isChatDisabled}
                        onFocus={() => !isExpanded && setIsExpanded(true)} 
                    />

                    <p className="text-xs text-gray-500 text-center mt-2">
                        AI-svar kan innehålla felaktigheter. Verifiera alltid kritisk information.
                    </p>
                </div>
            </div>
        </div>
    );
}
