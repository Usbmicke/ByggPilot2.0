'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/app/types';
import ReactMarkdown from 'react-markdown';

// =======================================================================
// UI Sub-components (med korrekt tema)
// =======================================================================

const UserMessage = ({ text }: { text: string }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-accent-blue text-white rounded-lg py-2 px-4 max-w-lg shadow-sm">
            {text}
        </div>
    </div>
);

const AssistantMessage = ({ text }: { text: string }) => (
    <div className="flex justify-start mb-4">
        <div className="bg-background-primary text-text-primary rounded-lg py-2 px-4 max-w-lg shadow-sm">
            <ReactMarkdown components={{ a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline" {...props} /> }}>
                {text}
            </ReactMarkdown>
        </div>
    </div>
);

const LoadingIndicator = () => (
    <div className="flex justify-start mb-4">
        <div className="bg-background-primary text-text-secondary rounded-lg py-2 px-4">
           <span className="animate-pulse">ByggPilot tänker...</span>
        </div>
    </div>
);

// =======================================================================
// Main Message List Component
// =======================================================================

interface ChatListProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export default function Chat({ messages, isLoading }: ChatListProps) {
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    return (
        // ÅTERSTÄLLD: `flex-1` för att laga den kollapsade layouten.
        <div className="flex-1 p-4 md:p-6 space-y-4">
            {messages.map((msg, index) => 
                msg.role === 'user' ? 
                <UserMessage key={index} text={msg.content} /> :
                <AssistantMessage key={index} text={msg.content} />
            )}
            {isLoading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
        </div>
    );
}
