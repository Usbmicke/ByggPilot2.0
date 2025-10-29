
'use client';

import React, { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, ShieldCheckIcon, DocumentPlusIcon } from '@heroicons/react/24/solid';
import CompanyNameInput from '@/components/onboarding/CompanyNameInput';
// VÄRLDSKLASS-KORRIGERING: Importerar de korrekta, nya server-åtgärderna.
import { saveOnboardingData, createOnboardingProject } from '@/app/onboarding/actions';

type OnboardingStep = 'companyInfo' | 'welcome' | 'terms' | 'security' | 'creating' | 'success';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300 animate-pulse">Jag bygger ditt digitala kontor...</p>
    </div>
);

export function GuidedOnboarding() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const initialStep: OnboardingStep = session?.user?.companyName ? 'welcome' : 'companyInfo';
    const [step, setStep] = useState<OnboardingStep>(initialStep);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [hasAgreed, setHasAgreed] = useState(false);

    // VÄRLDSKLASS-KORRIGERING: Använder den nya saveOnboardingData-åtgärden.
    const handleCompanyInfoSubmit = async (companyName: string) => {
        setError(null);
        startTransition(async () => {
            const result = await saveOnboardingData({ companyName });
            if (result.success) {
                await update({ companyName }); // Uppdaterar sessionen lokalt
                setStep('welcome');
            } else {
                setError(result.error || 'Kunde inte spara företagsinformation.');
            }
        });
    };

    // VÄRLDSKLASS-KORRIGERING: Använder den nya createOnboardingProject-åtgärden.
    const handleCreateStructure = () => {
        if (!hasAgreed) {
            setError("Du måste godkänna villkoren för att fortsätta.");
            return;
        }
        setStep('creating');
        setError(null);
        startTransition(async () => {
            const result = await createOnboardingProject();
            if (result.success) {
                // VÄRLDSKLASS-TILLÄGG: Uppdaterar sessionen med att onboarding är klar.
                await update({ onboardingComplete: true });
                setStep('success');
            } else {
                setError(result.error || 'Något gick fel vid skapande av mappstruktur.');
                setStep('terms'); 
            }
        });
    };

    const completeOnboarding = () => {
        router.push('/dashboard');
    };

    const renderContent = () => {
        switch (step) {
            case 'companyInfo':
                return <CompanyNameInput onSubmit={handleCompanyInfoSubmit} error={error} isPending={isPending} />;

            case 'welcome':
                return (
                    <div className="animate-fade-in">
                        <h1 className="text-4xl font-bold text-white">Välkommen ombord, {session?.user?.name?.split(' ')[0] || ''}!</h1>
                        <p className="mt-4 text-lg text-gray-300">
                           Jag är ByggPilot, din nya digitala kollega. Mitt jobb är att eliminera ditt papperskaos genom att automatisera administrationen direkt i ditt befintliga Google Workspace.
                        </p>
                        <div className="mt-8">
                            <button onClick={() => setStep('terms')} className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50">
                                Starta konfigurationen <ArrowRightIcon className='h-5 w-5'/>
                            </button>
                            <button onClick={() => setStep('security')} className="w-full text-center mt-4 text-sm text-cyan-400 hover:text-cyan-300 py-2">
                                Mer om säkerheten
                            </button>
                        </div>
                    </div>
                );
            
            case 'terms':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3">
                            <DocumentPlusIcon className="h-10 w-10 text-cyan-400" />
                            <h2 className="text-3xl font-bold text-white">Skapa mappstruktur</h2>
                        </div>
                         <p className="mt-4 text-gray-300">
                           Som ett första steg skapar jag en standardiserad mappstruktur i din Google Drive för <strong className='font-bold text-cyan-300'>{session?.user?.companyName}</strong>. Detta lägger grunden för automatiserad dokumenthantering. Ingen data raderas.
                        </p>
                        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                            <div className="flex items-start">
                                <input id="agree" name="agree" type="checkbox" checked={hasAgreed} onChange={() => setHasAgreed(!hasAgreed)} className="h-6 w-6 mt-1 bg-gray-700 border-gray-500 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer" />
                                <label htmlFor="agree" className="ml-3 block text-sm text-gray-300">
                                    Jag förstår att ByggPilot kommer att skapa en ny mapp, <strong className="font-semibold">"ByggPilot - {session?.user?.companyName}"</strong>, med undermappar i min anslutna Google Drive.
                                </label>
                            </div>
                        </div>
                        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                           <button onClick={() => setStep('welcome')} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                                Tillbaka
                            </button>
                            <button onClick={handleCreateStructure} disabled={!hasAgreed || isPending} className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50">
                                {isPending ? 'Skapar...' : 'Ja, skapa struktur'}
                            </button>
                        </div>
                    </div>
                )

            case 'security':
                 return (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3">
                           <ShieldCheckIcon className="h-10 w-10 text-cyan-400"/>
                           <h2 className="text-3xl font-bold text-white">Säkerhet & Transparens</h2>
                        </div>
                        <div className="mt-4 space-y-4 text-gray-300">
                            <p><strong>Dina data är dina.</strong> Allt stannar säkert i ditt eget Google Drive. ByggPilot lagrar inga filer.</p>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                                <li>Vi använder Googles egen säkra inloggningsteknik (OAuth 2.0).</li>
                                <li>Du kan när som helst ta bort åtkomsten via dina Google-inställningar.</li>
                                <li>All din data skyddas av Googles infrastruktur.</li>
                            </ul>
                        </div>
                        <div className="mt-8">
                            <button onClick={() => setStep('welcome')} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                                Tillbaka
                            </button>
                        </div>
                    </div>
                )

            case 'creating':
                return <LoadingSpinner />;

            case 'success':
                return (
                    <div className="animate-fade-in text-center">
                        <CheckCircleIcon className="h-20 w-20 text-green-400 mx-auto animate-pulse" />
                        <h1 className="mt-6 text-4xl font-bold text-white">Klart!</h1>
                        <p className="mt-4 text-lg text-gray-300">
                           Din nya mappstruktur finns nu i Google Drive under mappen <strong className='text-cyan-300'>"ByggPilot - {session?.user?.companyName}"</strong>.
                        </p>
                        <div className="mt-8">
                            <button onClick={completeOnboarding} className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50">
                                Gå till Översikten <ArrowRightIcon className='h-5 w-5'/>
                            </button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="w-full h-full flex flex-col justify-center p-8 md:p-12 bg-gray-900/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full">
                 {renderContent()}
            </div>
        </div>
    )
}
