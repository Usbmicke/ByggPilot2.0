
'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import MessageSkeleton from '@/components/messages/MessageSkeleton';
import { cn } from '@/lib/utils'; // Importerar cn för enklare klasshantering

// =================================================================================
// MESSAGEFEED V2.1 - FÖRBÄTTRAD DESIGN & TEMASTYLING
// BESKRIVNING: Denna version byter ut hårdkodade färger mot temabaserade
// klasser från shadcn/ui (primary, muted) för ett konsekvent och rent utseende.
// =================================================================================

interface MessageFeedProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageFeed = ({ messages, isLoading }: MessageFeedProps) => {
    const feedEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scrolla ner automatiskt för att visa det senaste meddelandet
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Funktion för att hämta korrekt styling baserat på meddelanderoll
    const getBubbleClasses = (role: Message['role']) => {
        const baseClasses = 'max-w-2xl p-4 rounded-lg shadow-sm text-base leading-relaxed break-words';

        switch (role) {
            case 'user':
                // Användarens meddelanden: Primärfärg, högerjusterad
                return cn(baseClasses, 'bg-primary text-primary-foreground ml-auto');
            
            case 'assistant':
                // Assistentens meddelanden: Muted bakgrund, vänsterjusterad
                return cn(baseClasses, 'bg-muted text-muted-foreground');
            
            case 'tool':
                 // Verktygsanrop: Subtil, centrerad och informativ stil
                return cn(baseClasses, 'bg-muted/50 text-muted-foreground text-sm italic text-center mx-auto');
            
            default:
                return cn(baseClasses, 'bg-muted text-muted-foreground');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col">
                        <div className={getBubbleClasses(msg.role)}>
                             {/* Använder prose för snygg markdown-rendering */}
                            <div className="prose prose-invert prose-p:my-0 prose-headings:my-2 max-w-none">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Visa en skeleton-loader när AI:n skriver ett svar */}
                {isLoading && <MessageSkeleton />}
                
                {/* Tom div för att säkerställa att auto-scroll fungerar korrekt */}
                <div ref={feedEndRef} />
            </div>
        </div>
    );
};

export default MessageFeed;
