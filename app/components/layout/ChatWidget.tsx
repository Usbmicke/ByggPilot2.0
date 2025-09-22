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
import { auth } from '@/app/lib/firebase/client';
import { User, onAuthStateChanged } from 'firebase/auth'; // KORREKT IMPORT

interface ChatWidgetProps {
    userProfile: UserProfile | null;
}

const promptSuggestions = ["Skapa ett nytt projekt...", "Sammanfatta tidrapporter...", "Ge mig en checklista..."];
const ONBOARDING_WELCOME_MESSAGE = `**Välkommen till ByggPilot!**\n\nJag är din digitala kollega. Vad kan jag hjälpa dig med?`;

export default function ChatWidget({ userProfile }: ChatWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null); // State för Firebase-användare
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref för fil-input

    // --- STEG 1 (OMGJORT): Korrekt Autentiserings-lyssnare ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFirebaseUser(user);
                if (messages.length === 0) {
                     setMessages([{ role: 'assistant', content: ONBOARDING_WELCOME_MESSAGE }]);
                }
            } else {
                setFirebaseUser(null);
                setMessages([{ role: 'assistant', content: "Vänligen logga in för att använda chatten." }]);
            }
        });
        return () => unsubscribe(); // Städa upp lyssnaren
    }, [messages.length]);

    // Effekt för platshållartext
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(p => promptSuggestions[(promptSuggestions.indexOf(p) + 1) % promptSuggestions.length]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // --- STEG 3: Återställ Knapparnas Funktion ---
    const handleAttachmentClick = () => fileInputRef.current?.click();
    const handleMicClick = () => console.log("Röstinmatning aktiverad (framtida funktion).");
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            console.log("Vald fil:", file.name);
            // Framtida logik för filuppladdning här
            alert(`Filen "${file.name}" har valts (uppladdning ej implementerad).`);
        }
    };

    const handleSendMessage = async () => {
        const content = input.trim();
        if (!content || !firebaseUser) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const idToken = await firebaseUser.getIdToken(true); // Hämta färsk token

            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) throw new Error(await response.text());
            if (!response.body) throw new Error("Missing response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                fullResponse += decoder.decode(value, { stream: true });
                setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: fullResponse }]);
            }
        } catch (error) {
            console.error("Fel vid anrop till orkestreraren:", error);
            setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: `Ett fel uppstod: ${error instanceof Error ? error.message : String(error)}` }]);
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

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);
    
    const isChatDisabled = !firebaseUser || isLoading;

    return (
        <div className={`fixed bottom-0 left-0 md:left-64 right-0 z-40`}>
            <div className={`bg-background-secondary/90 backdrop-blur-lg border-t border-border-primary mx-auto max-w-7xl flex flex-col shadow-2xl-top rounded-t-lg transition-all duration-300 ${isExpanded ? 'h-[calc(100vh-5rem)]' : 'h-auto'}`}>
                {isExpanded && (
                     <div className="flex items-center justify-between p-3 border-b border-border-primary">
                        <h2 className="text-lg font-semibold">ByggPilot</h2>
                        <button onClick={() => setIsExpanded(false)}><ChevronDownIcon className="h-6 w-6" /></button>
                    </div>
                )}
                {isExpanded && <div className="flex-1 overflow-y-auto"><Chat messages={messages} isLoading={isLoading} /></div>}

                <div className="p-3">
                    <div className="flex items-end gap-2">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2"><ChevronUpIcon className="h-6 w-6" /></button>
                        
                        {/* STEG 3 KNAPPAR: Nu funktionella */}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button onClick={handleAttachmentClick} disabled={isChatDisabled} className="p-2 disabled:opacity-50"><PaperClipIcon className="h-6 w-6" /></button>
                        <button onClick={handleMicClick} disabled={isChatDisabled} className="p-2 disabled:opacity-50"><MicrophoneIcon className="h-6 w-6" /></button>

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => !isExpanded && setIsExpanded(true)}
                            placeholder={firebaseUser ? placeholder : "Logga in..."}
                            className="flex-1 bg-border-primary/70 rounded-lg px-4 py-2.5 resize-none max-h-48"
                            disabled={isChatDisabled}
                        />
                        <button onClick={handleSendMessage} disabled={!input.trim() || isChatDisabled} className="p-2 bg-accent-blue text-white rounded-full disabled:bg-border-primary">
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
