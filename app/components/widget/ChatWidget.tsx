'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '@/app/types/user';
import { Bot, User, X, Loader2, Sparkles } from 'lucide-react';
import { updateUserOnboardingStatus } from '@/app/lib/firebase/firestore'; // Funktion vi skapar härnäst
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWidgetProps {
    userProfile: UserProfile;
}

interface Message {
    id: number;
    sender: 'bot' | 'user';
    text: string;
    actions?: ActionButton[];
    isLoading?: boolean;
}

interface ActionButton {
    text: string;
    action: string;
    payload?: any;
}

const ChatWidget = ({ userProfile }: ChatWidgetProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Starta onboarding-flödet om det inte är slutfört
    useEffect(() => {
        if (userProfile.onboardingStatus !== 'complete') {
            setIsOpen(true);
            const initialMessage: Message = {
                id: 1,
                sender: 'bot',
                text: `Hej ${userProfile.displayName}! Jag är din personliga assistent. För att komma igång, ska vi koppla ditt Google Drive-konto?`,
                actions: [
                    { text: "Ja, tack!", action: 'start_drive_auth' },
                    { text: "Nej, senare", action: 'skip_onboarding' },
                ],
            };
            setMessages([initialMessage]);
        } else {
             setMessages([{
                id: 1,
                sender: 'bot',
                text: `Välkommen tillbaka, ${userProfile.displayName}! Hur kan jag hjälpa dig idag?`
            }]);
        }
    }, [userProfile]);

    const handleAction = async (action: string, payload?: any) => {
        // Inaktivera knapparna efter klick
        setMessages(prev => prev.map(m => ({ ...m, actions: undefined })) );

        // Lägg till användarens svar
        const userMessageText = action === 'start_drive_auth' ? "Ja, tack!" : "Nej, senare";
        const userMessage: Message = { id: Date.now(), sender: 'user', text: userMessageText };
        setMessages(prev => [...prev, userMessage]);
        
        // Lägg till en laddningsindikator
        const loadingMessage: Message = { id: Date.now() + 1, sender: 'bot', text: "", isLoading: true };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            // Uppdatera status i Firestore
            await updateUserOnboardingStatus(userProfile.id, 'complete');

            // Skicka ett bekräftelsemeddelande
            const botResponse: Message = {
                id: Date.now() + 2,
                sender: 'bot',
                text: "Perfekt! Onboardingen är nu slutförd. Du kan nu börja skapa projekt. Klicka på chatt-ikonen när du behöver hjälp."
            };
            setMessages(prev => prev.filter(m => !m.isLoading).concat(botResponse));
            
            // Stäng chatten efter en fördröjning
            setTimeout(() => setIsOpen(false), 5000);

        } catch (error) {
            console.error("Fel vid uppdatering av onboarding-status:", error);
            const errorResponse: Message = {
                id: Date.now() + 2,
                sender: 'bot',
                text: "Åh nej, något gick fel. Vi försöker igen senare. Du kan stänga detta fönster för nu."
            };
            setMessages(prev => prev.filter(m => !m.isLoading).concat(errorResponse));
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed bottom-24 right-8 w-full max-w-sm bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl z-50 border border-white/10"
                    >
                        <header className="flex items-center justify-between p-3 border-b border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-400" /> ByggPilot Assistent</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </header>

                        <div className="h-96 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 text-sm ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0"><Bot size={20} /></div>}
                                    <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'bot' ? 'bg-gray-700 rounded-bl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
                                        {msg.isLoading ? <Loader2 className="animate-spin" /> : msg.text}
                                        {msg.actions && (
                                            <div className="mt-3 flex gap-2">
                                                {msg.actions.map(btn => (
                                                    <button key={btn.action} onClick={() => handleAction(btn.action, btn.payload)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-semibold transition-all duration-200"> 
                                                        {btn.text}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><User size={20} /></div>}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-cyan-600 hover:bg-cyan-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-transform transform hover:scale-110 focus:outline-none ring-2 ring-cyan-400/50 focus:ring-4"
                aria-label={isOpen ? "Stäng chatt" : "Öppna chatt"}
            >
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? "x" : "bot"}
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? <X size={28} /> : <Bot size={28} />}
                    </motion.div>
                </AnimatePresence>
            </button>
        </>
    );
};

export default ChatWidget;
