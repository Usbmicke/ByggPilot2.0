
'use client';

import MessageFeed from '@/components/chat/MessageFeed';
import ChatInputWrapper from '@/components/chat/ChatInputWrapper';
import { useChatHandler } from '@/hooks/use-chat-handler';
import { CoreMessage } from 'ai';

// =================================================================================
// CHATT-FÖNSTER (v2.0 - Guldstandard)
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
        <div className="flex flex-col h-full bg-background-primary text-text-primary">
            <MessageFeed messages={messages} isLoading={isLoading} />
            
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
