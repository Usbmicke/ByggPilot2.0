
'use client';

import { useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { AI } from '@/app/action';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusIcon, SendHorizonalIcon, FilePlus02Icon, UserPlusIcon, Building02Icon, RocketIcon } from 'lucide-react';

// =================================================================================
// CHAT COMPONENT V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: Byggd från grunden för att vara hjärtat i den AI-drivna dashboarden.
// Den använder SWR för state management (`useUIState`), anropar Server Actions via `useActions`,
// och har ett modernt, responsivt UI byggt med shadcn/ui. "Skapa nytt"-knappen
// är central för att initiera de fyra kärnfunktionerna.
// =================================================================================

const menuOptions = [
    { label: 'ÄTA', icon: FilePlus02Icon, description: 'Starta en ny ÄTA-hantering' },
    { label: 'Ny kund', icon: UserPlusIcon, description: 'Lägg till en ny kund' },
    { label: 'Nytt projekt', icon: Building02Icon, description: 'Skapa ett helt nytt projekt' },
    { label: 'Offertmotorn', icon: RocketIcon, description: 'Starta offertverktyget' },
];

export function Chat() {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useUIState<typeof AI>();
    const { submit } = useActions<typeof AI>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setMessages(currentMessages => [
                ...currentMessages,
                { id: Date.now(), role: 'user', display: inputValue },
            ]);

            const responseMessage = await submit(inputValue);
            setMessages(currentMessages => [...currentMessages, responseMessage]);
            setInputValue('');
        }
    };
    
    const handleMenuClick = async (label: string) => {
        const responseMessage = await submit(`Skapa ${label}`);
        setMessages(currentMessages => [...currentMessages, 
            { id: Date.now(), role: 'user', display: `Skapa ${label}` }, 
            responseMessage
        ]);
    };

    return (
        <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <Card className={`max-w-xl p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            {message.display}
                        </Card>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t">
                 <div className="relative">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        placeholder="Skriv ett meddelande eller välj 'Skapa nytt'..."
                        className="pr-24 pl-12 h-12 text-base"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <PlusIcon className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2 mb-2">
                                <div className="grid">
                                    {menuOptions.map((option) => (
                                        <button key={option.label} onClick={() => handleMenuClick(option.label)} className="flex items-center p-2 rounded-md hover:bg-muted text-left">
                                            <option.icon className="h-5 w-5 mr-3"/>
                                            <div>
                                                <p className="font-semibold">{option.label}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button type="submit" onClick={handleSubmit} size="icon" className="absolute right-3 top-1/2 -translate-y-1/2">
                        <SendHorizonalIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
