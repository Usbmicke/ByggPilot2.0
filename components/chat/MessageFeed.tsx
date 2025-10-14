
'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import MessageSkeleton from '@/components/messages/MessageSkeleton'; // <-- NYTT

// =================================================================================
// MESSAGEFEED V2.0 - SKELETON & TOOL-VISUALISERING
// BESKRIVNING: Denna version kan nu visa en laddnings-skeleton när ett nytt
// meddelande genereras. Den kan också rendera meddelanden med rollen 'tool'
// för att visa när AI:n använder ett verktyg.
// Slutför Steg C.1 och förbereder för Steg C.2.
// =================================================================================

interface MessageFeedProps {
    messages: Message[];
    isLoading: boolean; // <-- NYTT: Tar emot laddningsstatus
}

const MessageFeed = ({ messages, isLoading }: MessageFeedProps) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scrolla ner automatiskt när nya meddelanden dyker upp
        feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading]);

    const getBubbleStyle = (role: Message['role']) => {
        const baseStyle = 'max-w-2xl p-4 rounded-xl shadow-md text-base leading-relaxed';
        switch (role) {
            case 'user':
                return `${baseStyle} bg-accent-blue text-white ml-auto`;
            case 'assistant':
                return `${baseStyle} bg-background-tertiary border border-border-primary text-gray-200`;
            // Stil för verktygsanrop (Steg C.2)
            case 'tool':
                return `${baseStyle} bg-gray-700 border border-gray-600 text-gray-400 text-sm italic text-center mx-auto`;
            default:
                return `${baseStyle} bg-background-tertiary border border-border-primary text-gray-200`;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div ref={feedRef} className="space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col">
                        <div className={getBubbleStyle(msg.role)}>
                            <div className="prose prose-invert prose-p:my-0 prose-headings:my-2">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Visa skeleton när AI:n genererar ett svar */}
                {isLoading && <MessageSkeleton />}
            </div>
        </div>
    );
};

export default MessageFeed;
