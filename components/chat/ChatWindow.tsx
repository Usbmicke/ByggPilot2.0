
'use client';

import MessageFeed from '@/components/chat/MessageFeed';
import ChatInputWrapper from '@/components/chat/ChatInputWrapper';
import { useChat } from '@ai-sdk/react';

const ChatWindow = () => {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
    } = useChat({
        api: '/api/chat',
    });

    return (
        <div className="flex flex-col h-full bg-background-primary text-text-primary">
            <MessageFeed messages={messages} isLoading={isLoading} />

            {error && (
                <div className="p-4 bg-red-500/20 text-red-300 border-t border-red-500/50">
                    <p className='font-semibold'>Ett fel uppstod</p>
                    <p className='text-sm'>{error.message}</p>
                </div>
            )}
            
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
