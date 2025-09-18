
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { ChatMessage } from '@/app/types';
import Chat from '@/app/components/Chat'; // Den "dumma" komponenten för att visa meddelanden

// Detta är den "smarta" förälderkomponenten.
// Den hanterar state, formulär och API-anrop.
export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialt meddelande från ByggPilot
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                content: "Hej! ByggPilot här, din digitala kollega. Vad kan jag hjälpa dig med idag?\n\nFör att ge dig de bästa råden, kan du berätta lite om din roll och hur stort ert företag är?"
            }
        ]);
    }, []);

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Skicka hela konversationen till backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }), 
            });

            if (!response.ok) {
                throw new Error('Något gick fel med API-anropet.');
            }

            const data = await response.json();
            const assistantMessage: ChatMessage = data.message;

            setMessages(prevMessages => [...prevMessages, assistantMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Ursäkta, jag har lite problem med anslutningen just nu. Försök igen om en liten stund.'
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Flexbox-layout för att hålla input-fältet i botten
        <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-800 text-white">
            
            {/* Meddelandelistan, tar upp allt tillgängligt utrymme */}
            <div className="flex-1 overflow-y-auto">
                <Chat messages={messages} isLoading={isLoading} />
            </div>

            {/* Inmatningsfält och knapp i botten */}
            <div className="p-4 md:p-6 bg-gray-900 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Skriv ditt meddelande..."
                        className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-cyan-600 font-semibold rounded-lg hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Skicka
                    </button>
                </form>
            </div>
        </div>
    );
}
