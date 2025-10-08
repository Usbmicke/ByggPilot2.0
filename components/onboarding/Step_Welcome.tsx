
'use client';

import React, { useState } from 'react';
import { FiArrowRight, FiInfo, FiXCircle } from 'react-icons/fi';

interface Step_WelcomeProps {
    userName: string;
    onProceed: () => void;
    onSkip: () => void;
    onShowSecurity: () => void;
    error: string | null; // Acceptera ett felmeddelande
}

export default function Step_Welcome({ userName, onProceed, onSkip, onShowSecurity, error }: Step_WelcomeProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleProceedClick = () => {
        setIsLoading(true);
        onProceed();
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-2xl p-8 text-center shadow-2xl animate-fade-in-down">
            <h2 className="text-4xl font-bold text-white mb-4">Välkommen till ByggPilot, {userName}!</h2>
            <p className="text-lg text-gray-300 mb-6">
                För att komma igång, anslut ditt Google-konto. Detta skapar en säker mappstruktur på din Google Drive där alla dina projekt, offerter och dokument kommer att lagras.
            </p>

            {/* ========= FELMEDDELANDE ========= */}
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <FiXCircle className="h-5 w-5"/>
                    <div>
                        <p className="font-semibold">Kunde inte skapa mappstruktur</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={handleProceedClick} 
                    disabled={isLoading} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Ansluter...
                        </>
                    ) : (
                        <>
                            Anslut Google Konto & Skapa Struktur <FiArrowRight />
                        </>
                    )}
                </button>
            </div>

            <div className="mt-6 text-sm text-gray-400">
                <button onClick={onShowSecurity} className="flex items-center justify-center gap-1 mx-auto hover:text-cyan-400 transition-colors">
                    <FiInfo /> Varför behöver ni åtkomst?
                </button>
                <p className="mt-4">eller</p>
                <button onClick={onSkip} className="mt-2 hover:text-cyan-400 transition-colors">
                    hoppa över detta och fortsätt till dashboarden.
                </button>
            </div>
        </div>
    );
}
