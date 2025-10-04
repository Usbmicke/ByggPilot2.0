
'use client';

import { useChat } from '@/app/contexts/ChatContext';
import { PaperAirplaneIcon, StopCircleIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
    onFocus: () => void;
    isExpanded: boolean;
}

export default function ChatInput({ onFocus, isExpanded }: ChatInputProps) {
    const { session, isLoading, sendMessage, stop } = useChat();
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isChatDisabled = session.status !== 'authenticated';

    const handleSendMessage = () => {
        if (content.trim() && !isLoading && !isChatDisabled) {
            sendMessage(content);
            setContent('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
    }, [content]);
    
    useEffect(() => {
        if (isExpanded) {
            textareaRef.current?.focus();
        }
    }, [isExpanded]);

    return (
        <div className="flex items-end gap-2">
            <div className="relative flex-grow">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    placeholder={isChatDisabled ? 'Logga in för att chatta' : 'Ställ din fråga till ByggPilot...'}
                    className="pr-12 resize-none bg-background-tertiary border-border-primary focus:ring-1 focus:ring-accent-blue transition-all duration-200"
                    rows={1}
                    disabled={isChatDisabled || isLoading}
                />
                <div className="absolute right-2 bottom-2 flex items-center">
                     {/* Denna logik är bortkommenterad tills bilage-funktionen är fullt implementerad
                    <Button variant="ghost" size="icon" className="text-text-secondary hover:bg-background-tertiary" disabled={isLoading || isChatDisabled}>
                        <PaperClipIcon className="h-6 w-6" />
                    </Button>
                    */}
                </div>
            </div>

            {isLoading ? (
                <Button variant="outline" size="icon" onClick={stop} className="flex-shrink-0 bg-background-secondary hover:bg-red-500/20">
                    <StopCircleIcon className="h-6 w-6 text-red-500" />
                </Button>
            ) : (
                <Button 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={!content.trim() || isChatDisabled} 
                    className="flex-shrink-0 bg-accent-blue hover:bg-accent-blue/90 text-white"
                >
                    <PaperAirplaneIcon className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
