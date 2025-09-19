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
    "Skapa en komplett riskanalys för mitt nya projekt...",
    "Sammanfatta förra veckans tidrapporter...",
    "Ge mig en checklista för egenkontroll vid VVS-installation...",
    "Skriv ett utkast till ett ÄTA-underlag för tilläggsarbete...",
    "Vilka BBR-krav gäller för tillgänglighet i flerbostadshus?..."
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
            // Använd realtidsdata från profilen för att avgöra nästa steg
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

    // --- Logik för att hantera mappstruktur-skapande ---
    const handleCreateDriveStructure = async () => {
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: 'Ja, skapa mappstrukturen.' }]);
        
        try {
            const response = await fetch('/api/google/drive/create-initial-structure', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`API-anrop misslyckades med status: ${response.status}`);
            }

            // Uppdateringen av meddelanden och onboarding-steg kommer nu att hanteras
            // automatiskt av `useEffect` när `userProfile` uppdateras via Firestore listener.
            // Vi behöver inte manuellt lägga till ett meddelande här.

        } catch (error) {
            console.error("Fel vid skapande av mappstruktur:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Åh nej, något gick fel. Jag kunde inte skapa mappstrukturen just nu. Vi kan försöka igen senare.' }]);
        } finally {
            // Vi sätter inte isLoading till false här, eftersom vi inväntar Firestore-uppdateringen
            // som kommer att ändra komponentens state och ta bort laddningsindikatorn indirekt.
        }
    };


    // --- Logik för att hantera meddelanden ---
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
                className={`bg-gray-800/90 backdrop-blur-lg border-t border-gray-700 mx-auto max-w-7xl flex flex-col shadow-2xl-top transition-all duration-300 ease-in-out ${isExpanded ? 'h-[calc(100vh-5rem)] rounded-t-xl' : 'h-auto rounded-t-lg'}`}>

                {/* Header */}
                {isExpanded && (
                    <div className="flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-white">ByggPilot</h2>
                        <button onClick={() => setIsExpanded(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors">
                            <ChevronDownIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
                
                {/* Meddelandelista */}
                {isExpanded && (
                    <div className="flex-1 overflow-y-auto">
                        <Chat messages={messages} isLoading={isLoading} />
                    </div>
                )}

                {/* Botten-sektion */}
                <div className="p-3 flex-shrink-0">
                    
                    {/* Särskilda knappar för onboarding-steget */}
                    {onboardingStep === 'drive_setup' && !isLoading && (
                        <div className="flex gap-2 mb-3 justify-center">
                            <button onClick={handleCreateDriveStructure} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Ja, skapa struktur
                            </button>
                            <button onClick={() => {
                                setMessages([{ role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }]);
                                setOnboardingStep('complete');
                            }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Påminn mig senare
                            </button>
                        </div>
                    )}

                    {/* Input-fält och standardknappar */}
                    <div className="flex items-end gap-2">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors">
                            {isExpanded ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors" onClick={() => alert('Funktionen är under utveckling.')}>
                            <PaperClipIcon className="h-6 w-6" />
                        </button>
                         <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/70 transition-colors" onClick={() => alert('Funktionen är under utveckling.')}>
                            <MicrophoneIcon className="h-6 w-6" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => !isExpanded && setIsExpanded(true)}
                            placeholder={placeholder}
                            className="flex-1 bg-gray-700/70 text-white rounded-lg px-4 py-2.5 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none max-h-48 transition-all duration-200"
                            disabled={onboardingStep === 'drive_setup' || isLoading}
                        />
                        <button 
                            onClick={() => handleSendMessage()} 
                            disabled={!input.trim() || isLoading || onboardingStep === 'drive_setup'}
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
