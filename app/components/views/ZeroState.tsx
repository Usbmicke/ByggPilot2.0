'use client';

import React from 'react';
import Chat from '@/app/components/Chat';
import { ChatMessage } from '@/app/types';

interface ZeroStateProps {
    username: string;
}

export default function ZeroState({ username }: ZeroStateProps) {
    // Flyttad in i komponenten för att få tillgång till `username`
    const initialOnboardingMessage: ChatMessage = {
        role: 'assistant',
        content: `Välkommen, ${username}! Jag är ByggPilot, din digitala kollega.\n\nFör att vi ska kunna jobba effektivt behöver jag organisera dina projekt. Jag kan skapa en standardiserad mappstruktur åt dig i Google Drive. Det rekommenderas starkt.\n\nSka jag skapa mappstrukturen nu?`,
    };

    return (
        <div className="flex h-full w-full gap-8 p-4 bg-brand-dark/50">
            {/* Vänster kolumn: Välkomstinformation och kontext */}
            <div className="flex w-1/3 flex-col items-start justify-center rounded-lg bg-gray-800/60 p-8 text-white shadow-lg">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Bara ett steg kvar...
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                    ByggPilot organiserar allt ditt arbete i Google Drive. För att allt ska fungera måste vi skapa en grundläggande mappstruktur.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-300">
                    Svara "Ja" i chatten till höger för att låta din nya AI-kollega skapa mapparna åt dig. Detta ger dig en central plats för alla dina projekt, offerter, och fakturor.
                </p>
            </div>

            {/* Höger kolumn: Interaktiv AI-chatt */}
            <div className="w-2/3">
                 <Chat initialMessages={[initialOnboardingMessage]} />
            </div>
        </div>
    );
}
