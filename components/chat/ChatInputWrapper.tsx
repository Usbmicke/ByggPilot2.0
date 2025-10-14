'use client';

import { useCallback } from 'react';
import ChatInput from '@/components/chat/ChatInput';

interface ChatInputWrapperProps {
    projectId: string;
}

// Denna komponent behövs inte längre, all logik finns i ChatInput. 
// Behåller för framtida bruk om mer komplex klientlogik behövs.
export default function ChatInputWrapper({ projectId }: ChatInputWrapperProps) {
    
    const handleMessageSent = useCallback(() => {
        // Denna funktion kan användas för att t.ex. revalidera data
    }, []);

    return (
        <ChatInput projectId={projectId} onMessageSent={handleMessageSent} />
    );
}
