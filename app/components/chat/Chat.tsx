
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChatMessage } from '@/app/types';
import { IconSend, IconChevronDown, IconPaperclip, IconMic } from '@/app/constants';

interface ChatProps {
    isExpanded: boolean;
    setExpanded: (expanded: boolean) => void;
    startQuoteFlow: boolean;
    onQuoteFlowComplete: () => void;
    startOnboardingFlow: boolean;
    onOnboardingComplete: () => void;
}

const MessageRenderer: React.FC<{ content: string; onButtonClick: (text: string) => void; isAssistant: boolean }> = ({ content, onButtonClick, isAssistant }) => {
    const buttonRegex = /\\\[(.*?)\\]/g;
    const parts = content.split(buttonRegex);

    if (parts.length <= 1) {
        return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    const messageContent = parts.filter((_, i) => i % 2 === 0).join('').trim();
    const buttons = parts.filter((_, i) => i % 2 !== 0);

    return (
        <div>
            {messageContent && <p className="text-sm whitespace-pre-wrap mb-3">{messageContent}</p>}
            {isAssistant && buttons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {buttons.map((buttonText, index) => (
                        <button 
                            key={index} 
                            onClick={() => onButtonClick(buttonText)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-all duration-150 ease-in-out shadow-md"
                        >
                            {buttonText}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Chat: React.FC<ChatProps> = ({ isExpanded, setExpanded, startQuoteFlow, onQuoteFlowComplete, startOnboardingFlow, onOnboardingComplete }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isExpanded]);
    
    useEffect(() => {
        if(isExpanded && messages.length === 0 && !isLoading && !startOnboardingFlow && !startQuoteFlow){
            setIsLoading(true);
            setTimeout(() => {
                setMessages([{
                    id: 'welcome-1',
                    role: 'assistant',
                    content: "Hej! ByggPilot här, din digitala kollega. Vad kan jag hjälpa dig med idag?"
                }]);
                setIsLoading(false);
            }, 500);
        }
    }, [isExpanded, messages.length, isLoading, startOnboardingFlow, startQuoteFlow]);

    const sendMessage = useCallback(async (messageContent: string, trigger?: 'onboarding_start' | 'quote_start') => {
        if (messageContent.trim() === '' && !trigger) return;

        const isFlowStart = !!trigger;
        let currentMessages = messages;

        if (!isFlowStart) {
            const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: messageContent };
            currentMessages = [...messages, userMessage];
            setMessages(currentMessages);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: currentMessages, trigger }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Något gick fel med anropet till servern.');
            }

            const data = await response.json();
            const assistantMessage: ChatMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply.content };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (err: any) {
            setError(err.message || 'Kunde inte få ett svar. Försök igen.');
        } finally {
            setIsLoading(false);
            if (trigger === 'onboarding_start') onOnboardingComplete();
            if (trigger === 'quote_start') onQuoteFlowComplete(); // Återställ offertflödet
        }
    }, [isLoading, messages, onOnboardingComplete, onQuoteFlowComplete]);

    useEffect(() => {
        if (startOnboardingFlow) {
            setMessages([]);
            sendMessage('@onboarding_start', 'onboarding_start');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startOnboardingFlow]);

    // Ny useEffect för offertflödet
    useEffect(() => {
        if (startQuoteFlow) {
            setMessages([]); // Rensa historiken
            sendMessage('@quote_start', 'quote_start');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startQuoteFlow]);

    const handleSend = () => {
        sendMessage(input);
        setInput('');
    };

    const handleButtonClick = (buttonText: string) => {
        sendMessage(buttonText);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="bg-gray-800 border-t border-gray-700 flex-shrink-0 z-20 shadow-2xl">
             <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[70vh]' : 'max-h-0'}`}>
                <div className="h-[70vh] flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-900/70">
                         {messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <Image src="/images/byggpilotlogga1.png" alt="BP" width={32} height={32} className="w-8 h-8 p-1.5 rounded-full bg-gray-700 flex-shrink-0 self-start"/>
                                )}
                                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-500 text-white rounded-br-none' 
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                   <MessageRenderer 
                                        content={msg.content} 
                                        onButtonClick={handleButtonClick} 
                                        isAssistant={msg.role === 'assistant'}
                                    />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                           <div className="flex items-end gap-2 justify-start">
                                <Image src="/images/byggpilotlogga1.png" alt="BP" width={32} height={32} className="w-8 h-8 p-1.5 rounded-full bg-gray-700 flex-shrink-0"/>
                                <div className="px-4 py-3 bg-gray-700 rounded-2xl rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                         {error && (
                            <div className="flex justify-center">
                                <div className="text-center p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                                    <p className="text-sm font-semibold">Ett fel uppstod</p>
                                    <p className="text-xs">{error}</p>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-gray-700/50">
                <div className="flex items-center bg-gray-700 rounded-lg">
                    <button onClick={() => setExpanded(!isExpanded)} className="p-3 text-gray-400 hover:text-cyan-400"><IconChevronDown className={`w-6 h-6 transition-transform ${isExpanded ? '' : 'rotate-180'}`} /></button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setExpanded(true)}
                        placeholder="Ställ en fråga till ByggPilot..."
                        className="flex-grow bg-transparent p-2 text-sm text-gray-200 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button className="p-2 text-gray-400 hover:text-cyan-400"><IconPaperclip className="w-5 h-5"/></button>
                    <button className="p-2 text-gray-400 hover:text-cyan-400"><IconMic className="w-5 h-5"/></button>
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-3 text-cyan-500 disabled:text-gray-500"><IconSend className="w-6 h-6" /></button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
