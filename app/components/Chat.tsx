'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/app/types';
import ReactMarkdown from 'react-markdown';

// =======================================================================
// UI Sub-components (med mörkt tema)
// =======================================================================

const UserMessage = ({ text }: { text: string }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-cyan-600 text-white rounded-lg py-2 px-4 max-w-lg shadow-sm">
            {text}
        </div>
    </div>
);

const AssistantMessage = ({ text }: { text: string }) => (
    <div className="flex justify-start mb-4">
        {/* Anpassad bakgrundsfärg för mörkt tema */}
        <div className="bg-gray-700 text-gray-100 rounded-lg py-2 px-4 max-w-lg shadow-sm">
            <ReactMarkdown components={{ a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline" {...props} /> }}>
                {text}
            </ReactMarkdown>
        </div>
    </div>
);

const LoadingIndicator = () => (
    <div className="flex justify-start mb-4">
        <div className="bg-gray-700 text-gray-400 rounded-lg py-2 px-4">
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

// Detta är nu en "dum" komponent som bara renderar meddelanden.
// Den har ingen egen state för input eller skickande.
export default function Chat({ messages, isLoading }: ChatListProps) {
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Skrolla till botten när nya meddelanden dyker upp
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    return (
        // Ingen container med `bg-white` eller `border` här längre
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
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
