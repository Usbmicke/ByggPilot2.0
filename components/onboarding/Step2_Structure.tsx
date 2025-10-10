'use client';
import React, { useState, useTransition } from 'react';
import { createDriveStructure } from '@/app/actions/onboardingActions';
import { GoogleDriveLogo } from '@/components/icons/GoogleDriveLogo'; // Antagande att vi har en ikon-komponent

// =================================================================================
// GULDSTANDARD: ONBOARDING STEG 2 - PROJEKTSTRUKTUR
// UI och logik för att initiera skapandet av Google Drive-mappstruktur.
// =================================================================================

interface Step2StructureProps {
    onCompleted: () => void; // Funktion för att gå till nästa steg
}

export default function Step2_Structure({ onCompleted }: Step2StructureProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleCreateStructure = () => {
        setError(null);
        startTransition(async () => {
            const result = await createDriveStructure();
            if (result.success) {
                onCompleted();
            } else {
                setError(result.error || 'Ett okänt fel uppstod vid skapande av mappar.');
            }
        });
    };

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Vänster sida (Motivation) */}
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-4">Hitta allt, direkt. Alltid.</h1>
                <p className="text-lg text-gray-300">
                   Sluta leta i olika mappar och mejl. ByggPilot skapar nu en central, smart mappstruktur i er Google Drive. Varje nytt projekt får automatiskt en egen komplett uppsättning mappar för ritningar, KMA, offerter och foton. Full kontroll, noll administration.
                </p>
                 {/* Här kan en framtida animation/grafik placeras */}
            </div>

            {/* Höger sida (Interaktion) */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="mb-6">
                    <GoogleDriveLogo className="h-24 w-24" />
                </div>
                <p className="text-gray-300 mb-6">Ett klick för att skapa ett perfekt organiserat digitalt arkiv.</p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button onClick={handleCreateStructure} disabled={isPending} className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                    {isPending ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Skapar mappar...
                        </span>
                    ) : 'Skapa min smarta mappstruktur'}
                </button>
            </div>
        </div>
    );
}
