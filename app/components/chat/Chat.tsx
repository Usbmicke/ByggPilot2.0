'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/providers/AuthContext';
import { ChatMessage, MessageSender } from '@/app/types';
import { IconSend, IconChevronDown, IconChevronUp, IconPaperclip, IconMic } from '@/app/constants';
import { quoteFlowScript } from '@/app/services/quoteFlowScript';

interface ChatProps {
    isExpanded: boolean;
    setExpanded: (expanded: boolean) => void;
    startQuoteFlow: boolean;
    onQuoteFlowComplete: () => void;
}

const Chat: React.FC<ChatProps> = ({ isExpanded, setExpanded, startQuoteFlow, onQuoteFlowComplete }) => {
    const { isDemo } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [placeholder, setPlaceholder] = useState('Ställ en fråga till ByggPilot...');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Effekt för att hantera start av offert-flöde
    useEffect(() => {
        if (startQuoteFlow && isDemo) {
            setMessages([]); // Rensa tidigare meddelanden
            setIsLoading(true);

            let scriptIndex = 0;
            const runScript = () => {
                if (scriptIndex < quoteFlowScript.length) {
                    const item = quoteFlowScript[scriptIndex];
                    setMessages(prev => [...prev, item.message]);
                    scriptIndex++;
                    setTimeout(runScript, item.delay);
                } else {
                    setIsLoading(false);
                    onQuoteFlowComplete(); // Meddela att flödet är klart
                }
            };

            setTimeout(runScript, 500); // Starta flödet efter en kort paus
        }
    }, [startQuoteFlow, isDemo, onQuoteFlowComplete]);


    useEffect(() => {
        if (isExpanded) {
            scrollToBottom();
        }
    }, [messages, isExpanded]);
    
    // Välkomstmeddelande
    useEffect(() => {
        if(isExpanded && messages.length === 0 && !startQuoteFlow){
            setIsLoading(true);
            setTimeout(() => {
                 setMessages([
                    { id: 'welcome-1', sender: MessageSender.AI, text: "Välkommen till ByggPilot! Jag är din digitala kollega." },
                    { id: 'welcome-2', sender: MessageSender.AI, text: "Hur kan jag hjälpa dig idag?" }
                ]);
                setIsLoading(false);
            }, 1000);
        }
    }, [isExpanded, messages.length, startQuoteFlow]);

    // Roterande placeholders
    useEffect(() => {
        const placeholders = [
            "Skapa en riskanalys för Villa Ekhagen...",
            "Vilka uppgifter är kritiska den här veckan?",
            "Sammanfatta senaste mailet från 'Elfirman AB'...",
            "Vad är status på BRF Utsikten?",
        ];
        let placeholderIndex = 0;
        const intervalId = setInterval(() => {
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
            setPlaceholder(placeholders[placeholderIndex]);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleSend = useCallback(async () => {
        if (input.trim() === '' || isLoading || (startQuoteFlow && isDemo)) return; // Inaktivera sändning under demo-flöde
    
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          sender: MessageSender.USER,
          text: input,
        };
    
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        // Här skulle logik för att anropa AI finnas i live-läge
    }, [input, isLoading, startQuoteFlow, isDemo]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }

    return (
        <div className="bg-gray-800 border-t border-gray-700 flex-shrink-0 z-10">
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[80vh]' : 'max-h-0'}`}>
                <div className="h-[80vh] flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-900/70">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === MessageSender.AI && (
                                    <Image src="/images/byggpilotlogga1.png" alt="BP" width={32} height={32} className="w-8 h-8 p-1.5 rounded-full bg-gray-700 flex-shrink-0"/>
                                )}
                                <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${
                                    msg.sender === MessageSender.USER 
                                    ? 'bg-cyan-500 text-white rounded-br-none' 
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
                        <div ref={chatEndRef} />
                    </div>
                    {/* Borttagna knappar för mappstruktur och mail-läsning under chatten */}
                </div>
            </div>

            <div className="p-3">
                <div className="flex items-center bg-gray-700 rounded-lg">
                    <button 
                        onClick={() => setExpanded(!isExpanded)}
                        className="p-3 text-gray-400 hover:text-cyan-400 transition-colors"
                        aria-label={isExpanded ? "Minimera chatt" : "Expandera chatt"}
                    >
                        {isExpanded ? <IconChevronDown className="w-6 h-6" /> : <IconChevronUp className="w-6 h-6" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => { if(!startQuoteFlow) setExpanded(true) }}
                        placeholder={placeholder}
                        className="flex-grow bg-transparent p-2 text-sm text-gray-200 focus:outline-none"
                        disabled={isLoading || (startQuoteFlow && isDemo)}
                    />
                    <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors" aria-label="Bifoga fil">
                        <IconPaperclip className="w-5 h-5"/>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors" aria-label="Spela in röstmemo">
                        <IconMic className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === '' || (startQuoteFlow && isDemo)}
                        className="p-3 text-cyan-500 disabled:text-gray-500 hover:text-cyan-400 transition-colors"
                        aria-label="Skicka meddelande"
                    >
                        <IconSend className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
