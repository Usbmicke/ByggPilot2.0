
'use client';

import React from 'react';
import { ChatMessage } from '@/app/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PaperClipIcon } from '@heroicons/react/24/solid';

interface MessageProps {
    message: ChatMessage;
}

const Message = ({ message }: MessageProps) => {
    const isUser = message.role === 'user';

    // Funktion för att rendera en nedladdningslänk för bilagor
    const renderAttachment = (attachment: ChatMessage['attachment']) => {
        if (!attachment) return null;

        return (
            <a 
                href={attachment.content} // Base64-datan fungerar som en URL
                download={attachment.name}
                className="flex items-center gap-2 mt-2 px-3 py-2 text-sm bg-background-tertiary rounded-lg hover:bg-border-primary transition-colors duration-200 ease-in-out"
            >
                <PaperClipIcon className="h-5 w-5" />
                <span>{attachment.name}</span>
            </a>
        )
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-accent-blue text-white' : 'bg-background-tertiary'}`}>
                <div className="prose prose-sm max-w-none text-current">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
                 {message.attachment && renderAttachment(message.attachment)}
            </div>
        </div>
    );
};

export default Message;
