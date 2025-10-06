'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/app/contexts/ChatContext';
import ReactMarkdown from 'react-markdown';

interface MessageFeedProps {
    messages: ChatMessage[];
}

const MessageFeed = ({ messages }: MessageFeedProps) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [messages]);

    const getBubbleStyle = (role: 'user' | 'assistant') => {
        const baseStyle = 'max-w-2xl p-4 rounded-xl shadow-md text-base leading-relaxed';
        
        if (role === 'user') {
            return `${baseStyle} bg-accent-blue text-white ml-auto`;
        } else {
            return `${baseStyle} bg-background-tertiary border border-border-primary text-gray-200`; 
        }
    };

    return (
        <div ref={feedRef} className="flex-1 overflow-y-auto p-6 space-y-6">
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
        </div>
    );
};

export default MessageFeed;
