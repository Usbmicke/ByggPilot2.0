
'use client';

import React, { useState, useRef, FormEvent, useEffect } from 'react';
import {
    PaperClipIcon,
    PaperAirplaneIcon,
    XCircleIcon,
    ChevronUpIcon,
    StopCircleIcon
} from '@heroicons/react/24/outline';
import {
    MicrophoneIcon as MicSolid
} from '@heroicons/react/24/solid';
import {
    MicrophoneIcon as MicOutline
} from '@heroicons/react/24/outline';
import { useVoiceRecognition } from '@/app/hooks/useVoiceRecognition';

interface ChatInputProps {
    onSendMessage: (content: string, file?: File) => void;
    isChatDisabled: boolean;
    onFocus: () => void;
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    isLoading: boolean;
    stop: () => void;
}

// Nya, mer kraftfulla och professionella förslag
const promptSuggestions = [
    "Starta ett nytt projekt för [Kund] på [Adress]...",
    "Ge mig en sammanfattning av alla projekt markerade som \"pausade\".",
    "Sök i företagsminnet efter våra garantivillkor för badrum.",
    "Skapa en checklista för en säker arbetsplats vid takbyte.",
    "Lär dig: Vår standard för regelavstånd är cc600 för innerväggar."
];

const ChatInput = ({ onSendMessage, isChatDisabled, onFocus, isExpanded, setIsExpanded, isLoading, stop }: ChatInputProps) => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState<File | undefined>();
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isListening, error: voiceError, startListening, stopListening } = useVoiceRecognition((transcript) => {
        setInput(prev => prev + transcript);
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(p => promptSuggestions[(promptSuggestions.indexOf(p) + 1) % promptSuggestions.length]);
        }, 4000); // Längre intervall för mer komplexa förslag
        return () => clearInterval(interval);
    }, []);

    const handleAttachmentClick = () => fileInputRef.current?.click();
    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            setInput('');
            startListening();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        } else {
            setFile(undefined);
        }
    };

    const removeFile = () => {
        setFile(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e?: FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        if (isListening) stopListening();
        
        const content = input.trim();
        if (!content && !file) return;
        
        onSendMessage(content, file);
        setInput('');
        removeFile();
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

    return (
        <div className="relative">
             {file && (
                <div className="absolute bottom-full left-0 right-0 mb-2 flex justify-start">
                    <div className="flex items-center gap-2 bg-background-tertiary px-3 py-1.5 rounded-lg text-sm">
                        <PaperClipIcon className="h-4 w-4"/>
                        <span>{file.name}</span>
                        <button onClick={removeFile} type="button" className="text-gray-500 hover:text-white">
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                {voiceError && <div className="text-red-500 text-xs mb-2 absolute -top-6">{voiceError}</div>}
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {!isExpanded && (
                    <button type="button" onClick={() => setIsExpanded(true)} className="p-2 self-end">
                        <ChevronUpIcon className="h-6 w-6" />
                    </button>
                )}

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
                    onFocus={onFocus}
                    placeholder={isChatDisabled ? "Logga in..." : (isListening ? "Lyssnar..." : placeholder)}
                    className="flex-1 bg-border-primary/70 rounded-lg px-4 py-2.5 resize-none max-h-48"
                    disabled={isChatDisabled}
                />
                
                {isLoading ? (
                    <button type="button" onClick={stop} className="p-2 text-red-500 self-end">
                        <StopCircleIcon className="h-6 w-6" />
                    </button>
                ) : (
                    <button type="submit" disabled={(!input.trim() && !file) || isChatDisabled} className="p-2 bg-accent-blue text-white rounded-full self-end disabled:bg-border-primary">
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                )}
            </form>
        </div>
    );
};

export default ChatInput;
