'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface MessageInputProps {
    projectId: string;
    onMessageSent: () => void; 
}

export default function MessageInput({ projectId, onMessageSent }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!message.trim() || isSending) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch('/api/communication/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, text: message }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Kunde inte skicka meddelande.');
            }

            setMessage(''); // Rensa fältet
            onMessageSent(); // Meddela föräldern att uppdatera

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ett okänt fel inträffade.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Skriv ditt meddelande..."
                    className="flex-grow bg-gray-700/60 p-3 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition resize-none"
                    rows={2}
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-3 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 self-start"
                >
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </div>
            {error && <p className="text-red-500 text-sm pl-2">{error}</p>}
        </form>
    );
}
