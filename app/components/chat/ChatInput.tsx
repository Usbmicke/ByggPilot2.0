
'use client';

import React, { useRef, FormEvent, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    ChevronUpIcon,
    StopCircleIcon
} from '@heroicons/react/24/outline';
import {
    MicrophoneIcon as MicSolid
} from '@heroicons/react/24/solid';
import {
    MicrophoneIcon as MicOutline
} from '@heroicons/react/24/outline';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

// KVALITETSREVISION: ChatInput är nu en "controlled component"
interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isChatDisabled: boolean;
    onFocus: () => void;
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    isLoading: boolean;
    stop: () => void;
}

// KVALITETSREVISION: Tar bort hårdkodade förslagstexter. 
const ChatInput = ({
    value,
    onChange,
    isChatDisabled,
    onFocus,
    isExpanded,
    setIsExpanded,
    isLoading,
    stop
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
            const syntheticEvent = { target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
            startListening();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (textareaRef.current?.form) {
                // Säkerställer att formuläret skickas, vilket triggar useChat-hooken
                textareaRef.current.form.requestSubmit();
            }
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    // KVALITETSREVISION: Använder en statisk och mer informativ platshållare.
    const placeholderText = "Starta ett projekt, sök information, eller ställ en fråga...";

    return (
        <div className="relative">
            <div className="flex items-end gap-2">
                {voiceError && <div className="text-red-500 text-xs mb-2 absolute -top-6">{voiceError}</div>}

                {!isExpanded && (
                    <button type="button" onClick={() => setIsExpanded(true)} className="p-2 self-end">
                        <ChevronUpIcon className="h-6 w-6" />
                    </button>
                )}
                
                <button type="button" onClick={handleMicClick} disabled={isChatDisabled} className="p-2 self-end disabled:opacity-50">
                    {isListening ?
                        <MicSolid className="h-6 w-6 text-red-500 animate-pulse" /> :
                        <MicOutline className="h-6 w-6" />
                    }
                </button>

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    placeholder={isChatDisabled ? "Logga in för att chatta..." : (isListening ? "Lyssnar..." : placeholderText)}
                    className="flex-1 bg-border-primary/70 rounded-lg px-4 py-2.5 resize-none max-h-48"
                    disabled={isChatDisabled}
                />

                {isLoading ? (
                    <button type="button" onClick={stop} className="p-2 text-red-500 self-end">
                        <StopCircleIcon className="h-6 w-6" />
                    </button>
                ) : (
                    <button type="submit" disabled={!value.trim() || isChatDisabled} className="p-2 bg-accent-blue text-white rounded-full self-end disabled:bg-border-primary">
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatInput;
