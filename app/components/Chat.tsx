'use client';

import React from 'react';
import { ChatMessage } from '@/app/types';
import MessageFeed from './MessageFeed';
import ActionSuggestions from './dashboard/ActionSuggestions';

interface ChatProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export default function Chat({ messages, isLoading }: ChatProps) {
    // Visa action-knappar om det inte finns några meddelanden och det inte laddas
    if (messages.length === 0 && !isLoading) {
        return <ActionSuggestions />;
    }

    // Annars, visa meddelandeflödet
    return <MessageFeed messages={messages} isLoading={isLoading} />;
}
