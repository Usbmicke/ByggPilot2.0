
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChat as useVercelChat, CreateMessage } from 'ai/react';
import { useSession, SessionContextValue } from 'next-auth/react';
import { API_CHAT } from '@/app/constants/apiRoutes'; // IMPORTERA KONSTANT

// DEFINIERA TYPEN FÖR VÅR CONTEXT
interface ChatContextType {
    messages: any[];
    append: (message: CreateMessage) => Promise<string | null | undefined>;
    isLoading: boolean;
    stop: () => void;
    clearChat: () => void;
    input: string;
    setInput: (value: string) => void;
    handleInputChange: (e: any) => void;
    session: SessionContextValue;
}

// SKAPA CONTEXTEN
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// EXPORTERA EN CUSTOM HOOK FÖR ATT ANVÄNDA CONTEXTEN
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

// SKAPA PROVIDERN
// GULDSTANDARD V5.0 - CENTRALISERAD API-SÖKVÄG
// BESKRIVNING: Använder nu en importerad konstant `API_CHAT` för API-sökvägen.
// Detta minskar risken för stavfel och gör koden enklare att underhålla.
export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const session = useSession();
    const { 
        messages, 
        append, 
        isLoading, 
        stop, 
        setMessages,
        input,
        setInput,
        handleInputChange 
    } = useVercelChat({
        api: API_CHAT, // ANVÄND IMPORTERAD KONSTANT
    });

    const clearChat = () => {
        setMessages([]);
    };
    
    const contextValue: ChatContextType = {
        messages,
        append,
        isLoading,
        stop,
        clearChat,
        input,
        setInput,
        handleInputChange,
        session,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
