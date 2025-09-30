
'use client';

import React, { useState } from 'react';
import { useChat } from '@/app/contexts/ChatContext';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ChatTabs from '@/app/components/chat/ChatTabs';
import MessageList from '@/app/components/chat/MessageList';
import ChatInput from '@/app/components/chat/ChatInput';

export default function ChatWidget() {
    const { messages, isLoading, sendMessage, firebaseUser } = useChat();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSendMessage = async (content: string, file?: File) => {
        if (!content && !file) return;
        await sendMessage(content, file);
    };

    return (
        <div id="tour-step-4-chat" className={`fixed bottom-0 left-0 md:left-64 right-0 z-40`}>
            <div className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-7xl flex flex-col shadow-2xl-top rounded-t-lg transition-all duration-300 ${isExpanded ? 'h-[calc(100vh-5rem)]' : 'h-auto'}`}>

                {/* Header med expand/collapse-knapp */}
                <div className="flex items-center justify-between p-3 border-b border-border-primary">
                    <h2 className="text-lg font-semibold">ByggPilot</h2>
                    <button type="button" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                    </button>
                </div>

                {isExpanded && (
                    <>
                        {/* Flik-komponent */}
                        <ChatTabs />
                        
                        {/* Meddelandelista */}
                        <MessageList messages={messages} isLoading={isLoading} />
                    </>
                )}

                {/* Input-område */}
                <div className="p-3">
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isChatDisabled={!firebaseUser || isLoading} 
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
