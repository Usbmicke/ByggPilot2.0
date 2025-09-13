'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/app/types';
import ReactMarkdown from 'react-markdown';

// =======================================================================
// UI Sub-components
// =======================================================================

const UserMessage = ({ text }: { text: string }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-lg shadow-sm">
            {text}
        </div>
    </div>
);

const AssistantMessage = ({ text }: { text: string }) => (
    <div className="flex justify-start mb-4">
        <div className="bg-gray-100 text-gray-800 rounded-lg py-2 px-4 max-w-lg shadow-sm border">
            <ReactMarkdown components={{ a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" {...props} /> }}>
                {text}
            </ReactMarkdown>
        </div>
    </div>
);

const LoadingIndicator = () => (
    <div className="flex justify-start mb-4">
        <div className="bg-gray-100 text-gray-500 rounded-lg py-2 px-4 border">
           <span className="animate-pulse">ByggPilot tänker...</span>
        </div>
    </div>
);

// =======================================================================
// Quick Actions
// =======================================================================

const quickActions = [
    { label: "Ny Offert", trigger: "quote_start", command: '' },
    { label: "Skapa Projekt", command: "Skapa ett nytt projekt med namnet: ", trigger: '' },
    { label: "Ny Riskanalys", command: "Skapa en riskanalys för projektet: ", trigger: '' }
];

// =======================================================================
// Main Chat Component
// =======================================================================

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<null | HTMLInputElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const postToOrchestrator = async (body: object, currentMessages: ChatMessage[]) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);
            const { reply } = await response.json();
            setMessages([...currentMessages, reply]);
        } catch (error) {
            console.error("Orchestrator API call failed:", error);
            const errorMsg: ChatMessage = { role: 'assistant', content: 'Ett tekniskt fel uppstod. Kontakta support om problemet kvarstår.' };
            setMessages([...currentMessages, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');

        await postToOrchestrator({ messages: newMessages }, newMessages);
    };

    const handleQuickAction = async (action: typeof quickActions[0]) => {
        if (action.command) {
            setInput(action.command);
            inputRef.current?.focus();
        }
        if (action.trigger) {
            // For pure triggers, we send the current message history and the trigger
            await postToOrchestrator({ messages, trigger: action.trigger }, messages);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-md border">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => 
                    msg.role === 'user' ? 
                    <UserMessage key={index} text={msg.content} /> : 
                    <AssistantMessage key={index} text={msg.content} />
                )}
                {isLoading && <LoadingIndicator />}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-gray-50">
                 <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-600 mr-2">Starta direkt:</span>
                    {quickActions.map(action => (
                        <button
                            key={action.label}
                            onClick={() => handleQuickAction(action)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            disabled={isLoading}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Skriv ett kommando eller en fråga..."
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="ml-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-sm transition-colors"
                        disabled={isLoading || !input.trim()}
                    >
                        Skicka
                    </button>
                </form>
            </div>
        </div>
    );
}
