
'use client';

import React from 'react';
import { ChatMessage } from '@/app/types';
import { BeatLoader } from 'react-spinners';
import Message from '@/app/components/messages/Message'; // Importera den nya komponenten

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
            {messages.map((msg, index) => (
                <Message key={index} message={msg} />
            ))}
            {isLoading && (
                <div className="flex justify-start mb-4">
                    <div className={`max-w-2xl px-4 py-3 rounded-2xl bg-background-tertiary`}>
                        <BeatLoader size={8} color="#888" />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default MessageList;
