'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/app/types'; // Importera den korrekta typen

interface MessageFeedProps {
    projectId: string;
}

export default function MessageFeed({ projectId }: MessageFeedProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!projectId) return;
            
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/communication/messages?projectId=${projectId}`);
                if (!response.ok) {
                    throw new Error('Något gick fel vid hämtning av meddelanden.');
                }
                const data: Message[] = await response.json();
                setMessages(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ett okänt fel inträffade.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [projectId]);

    if (loading) {
        return <p className="text-center text-gray-500">Laddar meddelanden...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Fel: {error}</p>;
    }

    if (messages.length === 0) {
        return <p className="text-center text-gray-500">Inga meddelanden än. Bli den första att skriva något!</p>;
    }

    return (
        <div className="space-y-6">
            {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-4">
                    <Image 
                        src={message.author.avatarUrl || '/default-avatar.png'}
                        alt={`${message.author.name} avatar`}
                        width={40}
                        height={40}
                        className="rounded-full bg-gray-600"
                    />
                    <div className="flex-grow">
                        <div className="flex items-baseline gap-2">
                             <p className="font-semibold text-white">{message.author.name}</p>
                             <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString('sv-SE')}</p>
                        </div>
                        <div className="mt-1 bg-gray-900/70 p-3 rounded-lg rounded-tl-none">
                            <p className="text-gray-300 whitespace-pre-wrap">{message.text}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
