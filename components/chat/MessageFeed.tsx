
'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@ai-sdk/react'; // <-- Korrekt import!
import ReactMarkdown from 'react-markdown';

// =================================================================================
// MESSAGEFEED V1.1 - BUILD FIX
// REVIDERING: Uppdaterade komponenten till att använda den officiella `Message`-typen
// från `@ai-sdk/react`. Detta säkerställer kompatibilitet med den nya,
// optimerade ChatContext och löser typ-felet som skulle ha uppstått under bygget.
// =================================================================================

interface MessageFeedProps {
    messages: Message[]; // <-- Använder den korrekta typen
}

const MessageFeed = ({ messages }: MessageFeedProps) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [messages]);

    // Steg 1: Säkerställ att `getBubbleStyle` hanterar alla roller som `Message` kan ha.
    // Den nuvarande implementeringen hanterar bara 'user' och 'assistant', 
    // vilket är tillräckligt för vår nuvarande applikation.
    const getBubbleStyle = (role: Message['role']) => {
        const baseStyle = 'max-w-2xl p-4 rounded-xl shadow-md text-base leading-relaxed';
        
        if (role === 'user') {
            return `${baseStyle} bg-accent-blue text-white ml-auto`;
        } 
        // Alla andra roller (assistant, system, function, tool) får samma stil.
        return `${baseStyle} bg-background-tertiary border border-border-primary text-gray-200`; 
    };

    return (
        <div ref={feedRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                    <div className={getBubbleStyle(msg.role)}>
                        {/* Steg 2: Säkerställ att `prose` klasserna fungerar bra med markdown-innehållet. */}
                        <div className="prose prose-invert prose-p:my-0 prose-headings:my-2">
                            <ReactMarkdown>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageFeed;
