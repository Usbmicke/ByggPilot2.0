
'use client';

import MessageFeed from '@/components/chat/MessageFeed';
import ChatInputWrapper from '@/components/chat/ChatInputWrapper';
import { useChat } from '@ai-sdk/react';

// =================================================================================
// CHAT WINDOW V2.0 - MODERNISERING MED `useChat`
// BESKRIVNING: Denna komponent har totalrenoverats för att använda `useChat`-
// hooken från Vercel AI SDK. Detta ersätter den manuella, felbenägna `fetch`-
// logiken med en robust, branschstandard-lösning. Vi får nu automatiskt
// hantering av `isLoading`, `messages`, `input`, `handleInputChange` och `handleSubmit`.
// =================================================================================

const ChatWindow = () => {
    const {
        messages,      // Lista över alla meddelanden (användare, assistent, verktyg)
        input,         // Nuvarande värde i textrutan
        handleInputChange, // Funktion för att uppdatera `input`
        handleSubmit,  // Funktion för att skicka meddelandet
        isLoading,     // Boolean som är `true` när AI:n genererar ett svar
        error,         // Eventuellt felobjekt
    } = useChat({
        // `useChat` kommer automatiskt att göra en POST till denna endpoint.
        // Vår befintliga `app/api/chat/route.ts` fungerar perfekt för detta.
        api: '/api/chat',
    });

    return (
        <div className="flex flex-col h-full bg-background-primary text-text-primary">
            
            {/* MessageFeed tar nu emot `isLoading` för att kunna visa en skeleton. */}
            <MessageFeed messages={messages} isLoading={isLoading} />

            {error && (
                <div className="p-4 bg-red-500/20 text-red-300 border-t border-red-500/50">
                    <p className='font-semibold'>Ett fel uppstod</p>
                    <p className='text-sm'>{error.message}</p>
                </div>
            )}
            
            {/* Vår nya input-komponent som är optimerad för `useChat`-hooken */}
            <ChatInputWrapper
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ChatWindow;
