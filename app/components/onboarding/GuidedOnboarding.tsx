
'use client';

import React, { useState, useTransition } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Typdefinition för de olika stegen i onboardingen
type OnboardingStep = 'welcome' | 'security' | 'creating' | 'success';

// --- Animationskomponenter för de olika stegen ---

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300 animate-pulse">Jag bygger ditt digitala kontor...</p>
    </div>
);

// --- Huvudkomponenten för den guidade onboardingen ---

export function GuidedOnboarding() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Denna funktion kommer att anropas när användaren klickar på "Ja, skapa mappstruktur"
    const handleCreateStructure = async () => {
        setStep('creating');
        startTransition(async () => {
            try {
                // 1. Anropa API för att skapa mappstrukturen
                const response = await fetch('/api/onboarding/create-drive-structure', { method: 'POST' });
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Något gick fel i skapandet av mappstrukturen.');
                }

                // 2. Uppdatera användarens session för att markera onboardingen som klar
                await update({ onboardingComplete: true });
                
                // 3. Gå till framgångssteget
                setStep('success');

            } catch (err: any) {
                setError(err.message);
                setStep('welcome'); // Återgå till välkomststeget vid fel
            }
        });
    };

    const renderContent = () => {
        switch (step) {
            case 'welcome':
                return (
                    <>
                        <h1 className="text-4xl font-bold text-white">Välkommen ombord, {session?.user?.name?.split(' ')[0] || ''}!</h1>
                        <p className="mt-4 text-lg text-gray-300">
                            Jag är ByggPilot, din nya digitala kollega. Mitt jobb är att eliminera ditt papperskaos genom att automatisera administrationen direkt i ditt befintliga Google Workspace.
                        </p>
                        <p className="mt-6 text-lg text-gray-300">
                            Som ett första, kraftfullt steg för att skapa ordning och reda, vill du att jag skapar en standardiserad och branschanpassad mappstruktur direkt i din Google Drive?
                        </p>
                        {error && <p className="mt-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-md">Fel: {error}</p>}
                        <div className="mt-8 space-y-4">
                            <button onClick={handleCreateStructure} className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105">
                                Ja, skapa mappstruktur <ArrowRightIcon className='h-5 w-5'/>
                            </button>
                            <button onClick={() => setStep('security')} className="w-full text-sm text-cyan-400 hover:text-cyan-300 py-2">
                                Hur funkar det & hur hanteras min data?
                            </button>
                        </div>
                    </>
                );

            case 'security':
                return (
                    <>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3"><InformationCircleIcon className="h-8 w-8 text-cyan-400"/>Säkerhet & Transparens</h2>
                        <div className="mt-4 space-y-4 text-gray-300">
                            <p><strong>Dina data är dina.</strong> Det här är viktigt för oss att du förstår:</p>
                            <ul className="list-disc list-inside space-y-2 pl-2">
                                <li><strong>Jag är en gäst i ditt system:</strong> ByggPilot lagrar INGA av dina projektfiler, dokument eller mail. Allt stannar säkert i ditt eget Google Drive.</li>
                                <li><strong>Du har full kontroll:</strong> Du kan när som helst ta bort min åtkomst via dina Google-inställningar.</li>
                                <li><strong>Standardiserad säkerhet:</strong> Vi använder Googles egen säkra inloggningsteknik (OAuth 2.0). All din data skyddas av deras infrastruktur.</li>
                            </ul>
                        </div>
                        <div className="mt-8">
                            <button onClick={() => setStep('welcome')} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                                Tillbaka
                            </button>
                        </div>
                    </>
                )

            case 'creating':
                return <LoadingSpinner />;

            case 'success':
                return (
                    <>
                        <CheckCircleIcon className="h-20 w-20 text-green-400 mx-auto animate-pulse" />
                        <h1 className="mt-4 text-4xl font-bold text-white">Klart! Ditt digitala kontor är redo.</h1>
                        <p className="mt-4 text-lg text-gray-300">
                           Jag har skapat din nya mappstruktur i Google Drive. Du hittar den under mappen <strong className='text-cyan-300'>"ByggPilot - {session?.user?.companyName || 'Ditt Företag'}"</strong>.
                        </p>
                        <p className="mt-2 text-sm text-gray-400">(Från och med nu kommer allt jag skapar att sparas där automatiskt)</p>
                        <div className="mt-8">
                            <button onClick={() => router.push('/dashboard')} className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105">
                                Ja, kör igång! <ArrowRightIcon className='h-5 w-5'/>
                            </button>
                        </div>
                    </>
                );

        }
    }

    return (
        <div className="w-full h-full flex flex-col justify-center p-8 md:p-16 bg-gray-900/80 backdrop-blur-sm rounded-r-2xl">
            <div className="max-w-md mx-auto w-full">
                 {renderContent()}
            </div>
        </div>
    )
}
