
'use client';

import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { Message } from '@/components/messages/Message';
import { ChatInput } from '@/components/chat/ChatInput';

// Intern komponent som renderar själva chatt-gränssnittet
function ChatInterface() {
    const { messages, isLoading } = useChat();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
                {messages.map(msg => (
                    <Message key={msg.id} message={msg} />
                ))}
                {isLoading && <p>Tänker...</p>}
            </div>
            <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
                <ChatInput />
            </div>
        </div>
    );
}

// Huvudkomponent som omsluter allt med Providern
export function ChatWidget() {
    return (
        <ChatProvider>
            <ChatInterface />
        </ChatProvider>
    );
}
