
'use client';

import MessageFeed from '@/components/chat/MessageFeed';
import ChatInputWrapper from '@/components/chat/ChatInputWrapper';
import { useChatContext } from '@/app/contexts/ChatContext';

const ChatWindow = () => {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
    } = useChatContext();

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
