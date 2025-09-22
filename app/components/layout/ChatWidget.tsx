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
import { UserProfile } from '@/app/types/user';
import Chat from '@/app/components/Chat';

// --- Props Definition ---
interface ChatWidgetProps {
    userProfile: UserProfile | null;
}

// --- Konstanter ---
const promptSuggestions = [
    "Skapa ett nytt projekt för Bygg AB...",
    "Sammanfatta mina senaste tidrapporter...",
    "Ge mig en checklista för KMA-ronder...",
    "Skriv ett utkast till ett ÄTA-underlag...",
    "Vilka krav gäller för fallskydd på tak?"
];

const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din nya digitala kollega. Vad kan jag hjälpa dig med idag?`;

const DRIVE_SETUP_PROMPT = `**Anslutningen lyckades!**\n\nNu när jag har tillgång till ditt Google Workspace kan jag bli din riktiga digitala kollega. Som ett första steg för att skapa ordning och reda, vill du att jag skapar en standardiserad och effektiv mappstruktur i din Google Drive för alla dina projekt?`;

// =======================================================================
// Huvudkomponent: ChatWidget
// =======================================================================

export default function ChatWidget({ userProfile }: ChatWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false); 
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);
    const [onboardingStep, setOnboardingStep] = useState<'initial' | 'drive_setup' | 'complete'>('initial');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Effekt för proaktiv onboarding ---
    useEffect(() => {
        if (userProfile) {
            if (userProfile.onboardingStatus === 'complete' && !userProfile.driveFolderStructureCreated) {
                setMessages([{ role: 'assistant', content: DRIVE_SETUP_PROMPT }]);
                setOnboardingStep('drive_setup');
            } else {
                setMessages([{ role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }]);
                setOnboardingStep('complete');
            }
        }
    }, [userProfile]);

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

    // --- Logik för att hantera mappstruktur-skapande (Onboarding) ---
    const handleCreateDriveStructure = async () => {
        setIsLoading(true);
        const userMessage: ChatMessage = { role: 'user', content: 'Ja, skapa mappstrukturen.' };
        setMessages(prev => [...prev, userMessage]);
        // Anropa orkestreraren för att hantera detta
        await handleSendMessage('Skapa en standardiserad mappstruktur i min Google Drive.', [userMessage]);
    };

    // --- HJÄRNAN: Skickar meddelande till Orkestreraren (PROMPT 9.0) ---
    const handleSendMessage = async (messageContent?: string, messageHistory?: ChatMessage[]) => {
        const content = (messageContent || input).trim();
        if (!content) return;

        const userMessage: ChatMessage = { role: 'user', content };
        const newMessages: ChatMessage[] = messageHistory ? [...messages, ...messageHistory] : [...messages, userMessage];
        
        setMessages(newMessages);
        if(!messageContent) setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]); // Tom platshållare för svar

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.body) throw new Error("Response body is missing");
            if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    const updatedMessages = [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + chunk }];
                    return updatedMessages;
                });
            }
        } catch (error) {
            console.error("Fel vid anrop till orkestreraren:", error);
            setMessages(prev => {
                const updated = [...prev.slice(0, -1)]; // Ta bort den tomma platshållaren
                return [...updated, { role: 'assistant', content: "Ursäkta, ett fel uppstod. Jag kunde inte slutföra din förfrågan just nu." }];
            });
        } finally {
            setIsLoading(false);
            textareaRef.current?.focus();
        }
    };

    // --- Hantera skicka med Enter-tangenten ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Auto-justera höjden på textarean
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
                className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-7xl flex flex-col shadow-2xl-top transition-all duration-300 ease-in-out ${isExpanded ? 'h-[calc(100vh-5rem)] rounded-t-xl' : 'h-auto rounded-t-lg'}`}>

                {isExpanded && (
                    <div className="flex items-center justify-between p-3 border-b border-border-primary flex-shrink-0">
                        <h2 className="text-lg font-semibold text-text-primary">ByggPilot</h2>
                        <button onClick={() => setIsExpanded(false)} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-border-primary transition-colors">
                            <ChevronDownIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
                
                {isExpanded && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar-hide">
                        <Chat messages={messages} isLoading={isLoading} />
                    </div>
                )}

                <div className="p-3 flex-shrink-0">
                    {onboardingStep === 'drive_setup' && !isLoading && (
                        <div className="flex gap-2 mb-3 justify-center">
                            <button onClick={handleCreateDriveStructure} className="bg-accent-blue hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors">Ja, skapa struktur</button>
                            <button onClick={() => { setMessages([{ role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }]); setOnboardingStep('complete'); }} className="bg-border-primary hover:opacity-90 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Påminn mig senare</button>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-border-primary transition-colors">
                            {isExpanded ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                        </button>

                        {/* ÅTGÄRDAT: Knappar är nu aktiva för korrekt UI-känsla */}
                        <button className="p-2 text-text-secondary rounded-full transition-colors hover:text-text-primary hover:bg-border-primary"><PaperClipIcon className="h-6 w-6" /></button>
                        <button className="p-2 text-text-secondary rounded-full transition-colors hover:text-text-primary hover:bg-border-primary"><MicrophoneIcon className="h-6 w-6" /></button>

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => !isExpanded && setIsExpanded(true)}
                            placeholder={placeholder}
                            className="flex-1 bg-border-primary/70 text-text-primary rounded-lg px-4 py-2.5 border border-transparent focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none max-h-48 custom-scrollbar-hide"
                            disabled={isLoading || onboardingStep === 'drive_setup'}
                        />
                        <button 
                            onClick={() => handleSendMessage()} 
                            disabled={!input.trim() || isLoading || onboardingStep === 'drive_setup'}
                            className="p-2 rounded-full transition-colors bg-accent-blue text-white hover:opacity-90 disabled:bg-border-primary disabled:text-text-secondary disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
