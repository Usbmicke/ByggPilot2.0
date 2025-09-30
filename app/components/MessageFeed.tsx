'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/app/types';
import Spinner from '@/app/components/Spinner';
import ReactMarkdown from 'react-markdown';
import { PaperClipIcon } from '@heroicons/react/24/solid';

interface MessageFeedProps {
  messages: ChatMessage[];
}

export default function MessageFeed({ messages }: MessageFeedProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-text-secondary">Inga meddelanden än. Starta en konversation!</p>
        </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center font-bold text-white flex-shrink-0">
                        BP
                    </div>
                )}

                <div className={`rounded-lg px-4 py-2 max-w-2xl break-words ${message.role === 'user' ? 'bg-accent-blue text-white' : 'bg-background-tertiary'}`}>
                    {message.role === 'assistant' && message.content === '' ? (
                        <Spinner />
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent-blue-light hover:underline"/>}}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                    {message.attachment && (
                        <div className="mt-2 p-2.5 bg-background-primary/50 rounded-lg border border-border-primary">
                           <div className="flex items-center gap-2 text-sm">
                                <PaperClipIcon className="h-5 w-5"/>
                                <span>{message.attachment.name}</span>
                           </div>
                        </div>
                    )}
                </div>
            </div>
        ))}
        <div ref={endOfMessagesRef} />
    </div>
  );
}
