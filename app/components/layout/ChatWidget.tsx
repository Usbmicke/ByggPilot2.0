'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
    PaperClipIcon,
    PaperAirplaneIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
    MicrophoneIcon as MicSolid
} from '@heroicons/react/24/solid';
import {
    MicrophoneIcon as MicOutline
} from '@heroicons/react/24/outline';
import Chat from '@/app/components/Chat';
import { useChat } from '@/app/contexts/ChatContext'; // STEG 3: Importera useChat
import { useVoiceRecognition } from '@/app/hooks/useVoiceRecognition';

const promptSuggestions = ["Skapa ett nytt projekt...", "Sammanfatta tidrapporter...", "Ge mig en checklista..."];

export default function ChatWidget() {
    // All state-hantering är borttagen, hämtas från context istället
    const { messages, isLoading, firebaseUser, sendMessage } = useChat();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Röstigenkänning kopplas till den lokala input-staten
    const { isListening, error: voiceError, startListening, stopListening } = useVoiceRecognition((transcript) => {
        setInput(prev => prev + transcript);
    });

    // Hantera placeholder-rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(p => promptSuggestions[(promptSuggestions.indexOf(p) + 1) % promptSuggestions.length]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Hanterare för UI-interaktioner
    const handleAttachmentClick = () => fileInputRef.current?.click();
    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            setInput(''); // Rensa input innan lyssning startar
            startListening();
        }
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            console.log("Vald fil:", file.name);
            alert(`Filen "${file.name}" har valts (uppladdning ej implementerad).`);
        }
    };

    // Skicka meddelande via context-funktionen
    const handleSendMessage = async (e?: FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        if (isListening) stopListening();
        
        const content = input.trim();
        if (!content) return;
        
        await sendMessage(content);
        setInput('');
    };

    // Hantera Enter-tryck
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Justera höjden på textarean
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
                        <button type="button" onClick={() => setIsExpanded(false)}><ChevronDownIcon className="h-6 w-6" /></button>
                    </div>
                )}
                {isExpanded && <div className="flex-1 overflow-y-auto"><Chat messages={messages} isLoading={isLoading} /></div>}

                <div className="p-3">
                     {voiceError && <div className="text-red-500 text-xs mb-2">{voiceError}</div>} 
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                        <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-2 self-end"><ChevronUpIcon className="h-6 w-6" /></button>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={handleAttachmentClick} disabled={isChatDisabled} className="p-2 self-end disabled:opacity-50"><PaperClipIcon className="h-6 w-6" /></button>
                        
                        <button type="button" onClick={handleMicClick} disabled={isChatDisabled} className="p-2 self-end disabled:opacity-50">
                            {isListening ? 
                                <MicSolid className="h-6 w-6 text-red-500 animate-pulse" /> : 
                                <MicOutline className="h-6 w-6" />
                            }
                        </button>

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => !isExpanded && setIsExpanded(true)}
                            placeholder={firebaseUser ? (isListening ? "Lyssnar..." : placeholder) : "Logga in..."}
                            className="flex-1 bg-border-primary/70 rounded-lg px-4 py-2.5 resize-none max-h-48"
                            disabled={isChatDisabled}
                        />
                        <button type="submit" disabled={!input.trim() || isChatDisabled} className="p-2 bg-accent-blue text-white rounded-full self-end disabled:bg-border-primary">
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
