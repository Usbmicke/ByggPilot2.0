'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    PaperClipIcon, 
    MicrophoneIcon, 
    PaperAirplaneIcon, 
    ChevronUpIcon, 
    ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { ChatMessage } from '@/app/types';
import Chat from '@/app/components/Chat';

// --- Konstanter ---
const promptSuggestions = [
    "Skapa en komplett riskanalys för mitt nya projekt...",
    "Sammanfatta förra veckans tidrapporter...",
    "Ge mig en checklista för egenkontroll vid VVS-installation...",
    "Skriv ett utkast till ett ÄTA-underlag för tilläggsarbete...",
    "Vilka BBR-krav gäller för tillgänglighet i flerbostadshus?..."
];

const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din nya digitala kollega, redo att hjälpa dig att automatisera och effektivisera ditt administrativa arbete. För att komma igång behöver jag koppla mig till några av dina Google-tjänster. Jag frågar alltid om lov först.\n\nLåt oss börja med att sätta upp en standardiserad mappstruktur i din Google Drive. Skriv **\"starta konfiguration\"** för att börja.`;

// =======================================================================
// Huvudkomponent: ChatWidget
// =======================================================================

export default function ChatWidget() {
    const [isExpanded, setIsExpanded] = useState(false); 
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }]);
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Effekt för rullande platshållartext ---
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

    // --- Logik för att hantera meddelanden (simulerad) ---
    const handleSendMessage = async (messageContent?: string) => {
        const content = (messageContent || input).trim();
        if (!content) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 1500));
            setMessages(prev => [...prev, { role: 'assistant', content: `Jag har mottagit ditt meddelande: "${content}". Funktion för att behandla detta är under utveckling.`}]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Ett fel uppstod. Kunde inte behandla din förfrågan.`}]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Hantera skicka med Enter-tangenten ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Auto-justera höjden på textarean (förhindrar scrollbar)
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // --- RENDER-FUNKTION ---
    return (
        <div className={`fixed bottom-0 left-0 md:left-64 right-0 z-40 transition-all duration-300 ease-in-out`}>
            <div 
                className={`bg-gray-800/90 backdrop-blur-lg border-t border-gray-700 mx-auto max-w-7xl flex flex-col shadow-2xl-top transition-all duration-300 ease-in-out ${isExpanded ? 'h-[calc(100vh-5rem)] rounded-t-xl' : 'h-auto rounded-t-lg'}`}>

                {/* Header för widgeten (visas endast när expanderad) */}
                {isExpanded && (
                    <div className="flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-white">ByggPilot</h2>
                        <button 
                            onClick={() => setIsExpanded(false)} 
                            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors"
                        >
                            <ChevronDownIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
                
                {/* Meddelandelista (visas endast när expanderad) */}
                {isExpanded && (
                    <div className="flex-1 overflow-y-auto">
                        <Chat messages={messages} isLoading={isLoading} />
                    </div>
                )}

                {/* Botten-sektion med input och knappar (alltid synlig) */}
                <div className="p-3 flex-shrink-0">
                    <div className="flex items-end gap-2">
                        {/* Knapp för att expandera/kollapsa vyn */}
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)} 
                            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors"
                        >
                            {isExpanded ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                        </button>

                        {/* Knapp för att bifoga filer */}
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors" onClick={() => alert('Funktionen för att bifoga filer är under utveckling.')}>
                            <PaperClipIcon className="h-6 w-6" />
                        </button>

                        {/* Knapp för röstinmatning */}
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors" onClick={() => alert('Funktionen för röstinmatning är under utveckling.')}>
                            <MicrophoneIcon className="h-6 w-6" />
                        </button>

                        {/* Textinmatningsfält */}
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => !isExpanded && setIsExpanded(true)} // Expandera när man klickar i fältet
                            placeholder={placeholder}
                            className="flex-1 bg-gray-700/70 text-white rounded-lg px-4 py-2.5 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none max-h-48 transition-all duration-200"
                        />

                        {/* Skicka-knapp */}
                        <button 
                            onClick={() => handleSendMessage()} 
                            disabled={!input.trim() || isLoading}
                            className="p-2 rounded-full transition-colors bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
