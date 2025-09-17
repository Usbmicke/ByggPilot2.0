'use client';

import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

// Denna komponent är den *korrekta* vyn när en användare är klar med onboardingen
// men ännu inte har skapat något projekt.
export default function ZeroState() {

    // Funktion för att hantera klick på knappen.
    // I framtiden kan detta öppna en modal eller navigera till en ny sida.
    const handleCreateProject = () => {
        alert('Navigerar till sidan för att skapa ett nytt projekt...');
    };

    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-8">
            <div className="max-w-md">
                <h2 className="text-2xl font-bold text-white">Du har inga aktiva projekt än</h2>
                <p className="mt-3 text-lg text-gray-400">
                    Kom igång genom att skapa ditt första projekt.
                </p>
                <div className="mt-8">
                    <button
                        onClick={handleCreateProject}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors shadow-lg"
                    >
                        <PlusCircleIcon className="h-6 w-6" />
                        <span>Skapa ditt första projekt</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
