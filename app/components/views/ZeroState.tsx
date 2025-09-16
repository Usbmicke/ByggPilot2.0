'use client';

import React from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

interface ZeroStateProps {
    username: string;
}

// Denna komponent har nu förenklats.
// Den behöver inte längre en "Anslut"-knapp eftersom autentiseringen hanteras globalt.
export default function ZeroState({ username }: ZeroStateProps) {

    return (
        <div className="flex flex-col h-full w-full items-center justify-center p-4 text-center bg-gray-900">
            
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Välkommen, {username}!
                </h1>
                <p className="mt-6 text-xl leading-8 text-gray-300">
                    Jag är ByggPilot, din nya digitala kollega, redo att förenkla och automatisera ditt administrativa arbete.
                </p>
                <p className="mt-4 text-lg text-gray-400">
                    Allt är konfigurerat och klart. Vi har redan den åtkomst vi behöver för att arbeta med Google Drive.
                </p>
                
                <div className="mt-12 flex flex-col items-center gap-4">
                     <p className="font-semibold text-cyan-400">
                        Låt oss börja. Vad vill du göra först? Prata med mig i chatten nedan.
                    </p>
                    <ArrowDownIcon className="h-8 w-8 text-cyan-500 animate-bounce" />
                </div>

            </div>
        </div>
    );
}
