
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { CoreMessage } from 'ai';

// =================================================================================
// HOOK FÖR CHATT-HANTERING (v1.1 - StreamData-kompatibel)
// Denna hook kapslar in logiken för att interagera med den centrala chatt-API:n.
// Den kan nu extrahera chatId från en datastream för nya konversationer.
// =================================================================================

// Typa datan som kommer från experimental_StreamData
interface ChatStreamData {
  chatId?: string;
}

export function useChatHandler(initialMessages?: CoreMessage[], currentChatId?: string | null) {
    const [chatId, setChatId] = useState<string | null>(currentChatId || null);

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        setInput,
        setMessages,
        data
    } = useChat({
        api: '/api/chat',
        body: {
            chatId,
        },
        initialMessages,
    });

    // Effekt för att synka med externt chatId
    useEffect(() => {
        if (currentChatId) {
            setChatId(currentChatId);
        }
    }, [currentChatId]);

    // Effekt för att lyssna efter nytt chatId från servern via StreamData
    useEffect(() => {
        if (data && data.length > 0) {
            const latestData = data[data.length - 1] as ChatStreamData;
            if (latestData.chatId && !chatId) {
                setChatId(latestData.chatId);
                 // Uppdatera URL:en för att reflektera det nya chatId:t
                window.history.replaceState(null, '', `/chat/${latestData.chatId}`);
            }
        }
    }, [data, chatId]);

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        setInput,
        chatId, // Exponera chatId så att andra komponenter kan använda det
    };
}
