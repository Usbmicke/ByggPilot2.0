'use client';

import React, { useState, useEffect } from 'react';
import { PaperClipIcon, MicrophoneIcon, PaperAirplaneIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChatMessage } from '@/app/types';
import Chat from '@/app/components/Chat';

const promptSuggestions = [
    "Skapa en komplett riskanalys för detta projekt...",
    "Sammanfatta veckans tidrapporter...",
    "Skapa ett utkast till ABT 06-avtal med...",
    "Sammanfatta BBR-kraven för tätskikt i badrum...",
    "Ge mig en checklista för egenkontroll vid VVS-installation..."
];

export default function ChatWidget() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: 'Hej! Jag är ByggPilot. Ställ en fråga eller ge mig ett kommando för att komma igång.' }]);
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(prev => {
                const currentIndex = promptSuggestions.indexOf(prev);
                const nextIndex = (currentIndex + 1) % promptSuggestions.length;
                return promptSuggestions[nextIndex];
            });
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        try {
            console.log("Simulerar API-anrop för meddelande:", input);
            await new Promise(res => setTimeout(res, 1500));
            setMessages(prev => [...prev, { role: 'assistant', content: `Svar för: "${input}"`}]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Kunde inte behandla din förfrågan.`}]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        // HUVUDFIX: `top-20` (5rem/80px) läggs till när den är expanderad, vilket fäster den mot sidhuvudet.
        // `top-auto` används i kollapsat läge så att höjden bestäms av innehållet.
        <div className={`fixed bottom-0 left-64 right-0 z-50 transition-all duration-500 ease-in-out ${isExpanded ? 'top-20' : 'top-auto'}`}>
            {/* Den inre behållaren har nu `h-full` för att fylla hela den yttre behållarens utrymme. */}
            <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl-top border-t border-gray-700/80 max-w-7xl mx-auto rounded-t-lg flex flex-col h-full">
                
                <div className="flex-1 overflow-y-auto p-4" style={{ display: isExpanded ? 'block' : 'none' }}>
                    <Chat messages={messages} isLoading={isLoading} />
                </div>

                <div className="w-full px-4 py-3 border-t border-gray-700/80 mt-auto">
                    <div className="flex items-center w-full">
                        <button 
                            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                        </button>

                        <div className="relative flex-1 mx-2">
                            <textarea
                                placeholder={placeholder}
                                className="w-full bg-gray-900/70 border border-gray-600 rounded-lg text-white p-3 pr-32 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner transition-shadow duration-200"
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsExpanded(true)}
                                disabled={isLoading}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                <button className="p-2 text-gray-400 hover:text-white" onClick={() => alert('Bifoga fil kommer snart!')}>
                                    <PaperClipIcon className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white" onClick={() => alert('Röstinmatning kommer snart!')}>
                                    <MicrophoneIcon className="h-5 w-5" />
                                </button>
                                <button 
                                    className="p-2 text-cyan-400 hover:text-white disabled:text-gray-600"
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !input.trim()}
                                >
                                    <PaperAirplaneIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
