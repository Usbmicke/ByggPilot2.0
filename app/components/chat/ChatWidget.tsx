'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChevronDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/app/context/AuthContext'; // Importera useAuth för att få tillgång till användaren

// Typdefinition för ett meddelande i chatten
interface Message {
    id: number;
    author: 'ai' | 'user';
    text: string;
    link?: string;
}

// Det första meddelandet som visas
const initialMessages: Message[] = [
    {
        id: 1,
        author: 'ai',
        text: 'Anslutningen lyckades! Nu när jag har tillgång till ditt Google Workspace kan jag bli din riktiga digitala kollega. Som ett första steg för att skapa ordning och reda, vill du att jag skapar en standardiserad och effektiv mappstruktur i din Google Drive för alla dina projekt?'
    }
];

export default function ChatWidget() {
    const { user } = useAuth(); // Hämta den inloggade användaren
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [userInput, setUserInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // För att inaktivera knappar under anrop

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSend = () => {
        if (!userInput.trim()) return;
        console.log('Sending:', userInput);
        setUserInput('');
    };

    // Hanterar när användaren klickar på "Ja" eller "Nej"
    const handleQuickReply = async (reply: string) => {
        if (reply === 'Nej') {
            setMessages(prev => [...prev, { id: Date.now(), author: 'user', text: 'Nej tack' }, { id: Date.now() + 1, author: 'ai', text: 'Inga problem! Jag finns här om du ändrar dig.'}]);
            return;
        }

        if (reply === 'Ja') {
            setIsProcessing(true);
            setMessages(prev => [...prev, { id: Date.now(), author: 'user', text: 'Ja, tack gärna!' }, { id: Date.now() + 1, author: 'ai', text: 'Perfekt! Jag påbörjar arbetet i din Google Drive nu. Ett ögonblick...'}]);
            
            if (!user) {
                 setMessages(prev => [...prev, { id: Date.now() + 2, author: 'ai', text: 'Fel: Kunde inte verifiera din identitet. Prova att ladda om sidan.'}]);
                 setIsProcessing(false);
                 return;
            }

            try {
                const idToken = await user.getIdToken(true);
                const response = await fetch('/api/google/drive/create-initial-structure', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Något gick fel på servern.');
                }
                
                // Visa ett framgångsmeddelande med en länk till mappen
                setMessages(prev => [...prev, { id: Date.now() + 2, author: 'ai', text: `Sådär! ✨ Mappstrukturen är skapad. Du kan se den direkt i din Google Drive.`, link: result.folderLink }]);

            } catch (error: any) {
                console.error('Fel vid skapande av mappstruktur:', error);
                setMessages(prev => [...prev, { id: Date.now() + 2, author: 'ai', text: `Åh nej, något gick fel. Felmeddelande: ${error.message}` }]);
            }
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-0 md:right-8 z-50 w-full md:w-[400px]">
            <div 
                className="bg-gray-800 text-white flex justify-between items-center px-6 py-3 cursor-pointer border-t-2 border-cyan-500 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.3)] rounded-t-lg"
                onClick={handleToggle}
            >
                <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-cyan-400" />
                    <h3 className="font-bold text-lg">ByggPilot</h3>
                </div>
                <ChevronDownIcon className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-gray-900 border-x border-gray-700/70"
                    >
                        <div className="p-4 h-[400px] overflow-y-auto flex flex-col-reverse">
                            <div className="flex flex-col gap-4">
                                {messages.slice().reverse().map(msg => (
                                    <div key={msg.id} className={`flex flex-col gap-1 w-full max-w-[85%] ${msg.author === 'ai' ? 'items-start' : 'self-end items-end'}`}>
                                       <div className={`px-4 py-2 rounded-2xl ${msg.author === 'ai' ? 'bg-gray-700 text-gray-200 rounded-bl-none' : 'bg-cyan-600 text-white rounded-br-none'}`}>
                                         <p>{msg.text}</p>
                                         {msg.link && (
                                             <a href={msg.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-cyan-400 font-bold hover:underline">
                                                 Öppna mappen &rarr;
                                             </a>
                                         )}
                                       </div>
                                    </div>
                                ))}
                                 {/* Snabbsvarsknappar, visas bara om inga svar getts */}
                                 {messages.length === 1 && (
                                     <div className="flex gap-2 self-start pt-2">
                                        <button onClick={() => handleQuickReply('Ja')} disabled={isProcessing} className="px-4 py-1.5 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isProcessing ? 'Arbetar...' : 'Ja, skapa struktur'}
                                        </button>
                                        <button onClick={() => handleQuickReply('Nej')} disabled={isProcessing} className="px-4 py-1.5 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-colors text-sm disabled:opacity-50">
                                            Nej tack
                                        </button>
                                     </div>
                                 )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex items-center bg-gray-800 rounded-lg">
                                <input 
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ställ en fråga..."
                                    className="w-full bg-transparent p-3 focus:outline-none"
                                />
                                <button onClick={handleSend} className="p-3 text-cyan-400 hover:text-cyan-300 transition-colors">
                                    <PaperAirplaneIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
