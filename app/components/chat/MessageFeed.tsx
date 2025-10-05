'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/contexts/ChatContext';
import ReactMarkdown from 'react-markdown'; // STEG 1: Importera Markdown-renderaren

interface MessageFeedProps {
    messages: ChatMessage[];
}

// =================================================================================
// GULD STANDARD - MessageFeed (Klient-sida)
// Version 2.0 - Förbättrad design med premiumkänsla.
// =================================================================================

const MessageFeed = ({ messages }: MessageFeedProps) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [messages]);

    const getBubbleStyle = (role: 'user' | 'assistant') => {
        const baseStyle = 'max-w-2xl p-4 rounded-xl shadow-md text-base leading-relaxed'; // Ökad textstorlek och radavstånd
        
        if (role === 'user') {
            return `${baseStyle} bg-accent-blue text-white ml-auto`; // Användarens bubbla
        } else {
            // STEG 2: Elegantare, dämpad stil för AI:n
            return `${baseStyle} bg-background-tertiary border border-border-primary text-gray-200`; 
        }
    };

    return (
        <div ref={feedRef} className="flex-1 overflow-y-auto p-6 space-y-6"> {/* Ökat avstånd i feeden */}
            {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                    <div className={getBubbleStyle(msg.role)}>
                        {/* STEG 3: Använd ReactMarkdown för att rendera innehållet */}
                        <ReactMarkdown 
                            className="prose prose-invert prose-p:my-0 prose-headings:my-2"
                        >
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageFeed;
