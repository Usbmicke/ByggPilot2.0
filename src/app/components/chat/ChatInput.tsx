
'use client';

import React, { useRef, useEffect } from 'react';
import {
    ArrowUpIcon,
    StopCircleIcon,
    ChevronUpIcon,
    MicrophoneIcon
} from '@heroicons/react/24/solid';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isChatDisabled: boolean;
    onFocus: () => void;
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    isLoading: boolean;
    stop: () => void;
    // Prop för att skicka formuläret, kopplad till den överordnade komponenten
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; 
}

const ChatInput = ({
    value,
    onChange,
    isChatDisabled,
    onFocus,
    isExpanded,
    setIsExpanded,
    isLoading,
    stop,
    onSubmit
}: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { isListening, error: voiceError, startListening, stopListening } = useVoiceRecognition((transcript) => {
        const syntheticEvent = {
            target: { value: value + transcript }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
    });

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            // Rensa textområdet innan ny inspelning startar för en renare upplevelse
            const syntheticEvent = { target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
            startListening();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Skicka med Enter, men tillåt ny rad med Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (textareaRef.current?.form && !isChatDisabled && value.trim()) {
                textareaRef.current.form.requestSubmit();
            }
        }
    };

    // Justerar automatiskt höjden på textarean baserat på innehållet
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Återställ för att krympa korrekt
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [value]);

    const placeholderText = "Ställ en fråga till ByggPilot AI...";

    // --- RENDER-METOD --- 
    return (
        <form onSubmit={onSubmit} className="relative">
            {/* Behållare som ger den rundade, premium-känslan */}
            <div className="relative flex items-end w-full p-2 bg-zinc-800/80 backdrop-blur-md border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/30">
                
                {/* Mikrofonknapp - Vänster sida */}
                <button type="button" onClick={handleMicClick} disabled={isChatDisabled} className="p-2 flex-shrink-0 text-gray-400 hover:text-white disabled:opacity-50 transition-colors rounded-full">
                    <MicrophoneIcon className={`h-6 w-6 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                </button>

                {/* Textarea för input - Växer och är central */}
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    placeholder={isChatDisabled ? "Logga in för att chatta" : (isListening ? "Lyssnar..." : placeholderText)}
                    className="flex-1 bg-transparent px-3 py-2 resize-none max-h-48 text-base text-gray-200 placeholder:text-gray-500 focus:outline-none"
                    disabled={isChatDisabled}
                />

                {/* Skicka / Stopp-knapp - Höger sida */}
                <div className="flex-shrink-0">
                    {isLoading ? (
                        <button type="button" onClick={stop} className="p-3 text-red-500 bg-zinc-700/50 rounded-full hover:bg-zinc-700 transition-colors">
                            <StopCircleIcon className="h-6 w-6" />
                        </button>
                    ) : (
                        <button 
                          type="submit" 
                          disabled={!value.trim() || isChatDisabled} 
                          className="p-3 bg-cyan-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-cyan-700 active:scale-95 disabled:bg-zinc-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            <ArrowUpIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Felmeddelande för röstigenkänning - Visas ovanför rutan vid behov */}
            {voiceError && <p className="text-red-500 text-sm text-center mt-2 absolute -bottom-7 w-full">{voiceError}</p>}
        </form>
    );
};

export default ChatInput;
