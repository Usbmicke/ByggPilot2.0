'use client';

import React, { useState, useRef, FormEvent, useEffect } from 'react';
import {
    PaperClipIcon,
    PaperAirplaneIcon,
    XCircleIcon,
    ChevronUpIcon,
    StopCircleIcon,
    EllipsisVerticalIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import {
    MicrophoneIcon as MicSolid
} from '@heroicons/react/24/solid';
import {
    MicrophoneIcon as MicOutline
} from '@heroicons/react/24/outline';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatInputProps {
    onFocus: () => void;
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
}

const promptSuggestions = [
    "Starta ett nytt projekt för [Kund] på [Adress]...",
    "Ge mig en sammanfattning av alla projekt markerade som \"pausade\".",
    "Sök i företagsminnet efter våra garantivillkor för badrum.",
    "Skapa en checklista för en säker arbetsplats vid takbyte.",
    "Lär dig: Vår standard för regelavstånd är cc600 för innerväggar."
];

const ChatInput = ({ onFocus, isExpanded, setIsExpanded }: ChatInputProps) => {
    const {
        input,
        handleInputChange,
        sendMessage,
        isLoading,
        stop,
        messages,
        setMessages
    } = useChatContext();

    const [file, setFile] = useState<File | undefined>();
    const [placeholder, setPlaceholder] = useState(promptSuggestions[0]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const { isListening, error: voiceError, startListening, stopListening } = useVoiceRecognition((transcript) => {
        handleInputChange({ target: { value: input + transcript } } as React.ChangeEvent<HTMLInputElement>);
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(p => promptSuggestions[(promptSuggestions.indexOf(p) + 1) % promptSuggestions.length]);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAttachmentClick = () => fileInputRef.current?.click();
    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
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
    
    const clearChat = () => {
        setMessages([]);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        sendMessage(e);
        removeFile();
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const isChatDisabled = isLoading;

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

            <div ref={menuRef} className="absolute bottom-0 left-0 mb-[-0.5rem] self-end">
                {isMenuOpen && (
                    <div className="absolute bottom-full mb-2 bg-background-tertiary rounded-md shadow-lg border border-border-primary">
                        <button 
                            onClick={() => { clearChat(); setIsMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-left w-full hover:bg-border-primary/80"
                        >
                            <TrashIcon className="h-5 w-5" />
                            <span>Rensa chatt</span>
                        </button>
                    </div>
                )}
                <button type="button" onClick={() => setIsMenuOpen(o => !o)} disabled={isChatDisabled} className="p-2 self-end disabled:opacity-50 text-gray-500 hover:text-white">
                    <EllipsisVerticalIcon className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2 pl-12"> 
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
                    onChange={handleInputChange} 
                    onFocus={onFocus}
                    placeholder={isChatDisabled ? "Laddar..." : (isListening ? "Lyssnar..." : placeholder)}
                    className="flex-1 bg-border-primary/70 rounded-lg px-4 py-2.5 resize-none max-h-48"
                    disabled={isChatDisabled}
                />
                
                {isLoading ? (
                    <button type="button" onClick={stop} className="p-2 text-red-500 self-end">
                        <StopCircleIcon className="h-6 w-6" />
                    </button>
                ) : (
                    <button type="submit" disabled={!(input || '').trim() || isChatDisabled} className="p-2 bg-accent-blue text-white rounded-full self-end disabled:bg-border-primary">
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                )}
            </form>
        </div>
    );
};

export default ChatInput;