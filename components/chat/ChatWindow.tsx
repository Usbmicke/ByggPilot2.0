
'use client';

import MessageFeed from '@/components/chat/MessageFeed';
import ChatInputWrapper from '@/components/chat/ChatInputWrapper';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { CoreMessage } from 'ai';

// =================================================================================
// CHATT-FÖNSTER (v2.1 - Förbättrad Layout)
// Denna komponent är nu en "dum" presentationskomponent.
// Den använder den rena useChatHandler-hooken för all sin logik.
// =================================================================================

interface ChatWindowProps {
    initialMessages: CoreMessage[];
    chatId: string | null;
}

const ChatWindow = ({ initialMessages, chatId }: ChatWindowProps) => {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
    } = useChatHandler(initialMessages, chatId);

    return (
        <div className="relative flex flex-col h-full bg-card text-card-foreground rounded-lg overflow-hidden">
            {/* MessageFeed tar nu upp allt tillgängligt utrymme och är scrollbart */}
            <div className="flex-1 overflow-y-auto">
                <MessageFeed messages={messages} isLoading={isLoading} />
            </div>
            
            {/* Input-fältet är alltid förankrat i botten */}
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
