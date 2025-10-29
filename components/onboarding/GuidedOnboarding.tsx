'use client';

import React, { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircleIcon, ArrowRightIcon, ShieldCheckIcon, DocumentPlusIcon, ArrowTopRightOnSquareIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import CompanyNameInput from '@/components/onboarding/CompanyNameInput';
import { completeOnboardingStep } from '@/app/onboarding/actions';
import { Session } from 'next-auth';

type OnboardingStep = 'companyInfo' | 'welcome' | 'terms' | 'security' | 'creating' | 'success';

// --- GULDSTANDARD ARKITEKTUR-FIX ---
// Denna funktion är nu den ENDA källan till sanning för vilket steg som ska visas.
// Den härleder steget direkt från sessionen, vilket eliminerar all risk för race conditions.
const determineCurrentStep = (session: Session | null): OnboardingStep => {
    if (!session?.user) return 'companyInfo'; // Fallback
    if (!session.user.companyName) return 'companyInfo';
    if (!session.user.driveRootFolderId) return 'welcome'; // Om företagsnamn finns men inte Drive-mappen, börja här.
    return 'success'; // Om allt är klart, visa framgång.
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-text-secondary animate-pulse">Jag bygger ditt digitala kontor...</p>
    </div>
);

export function GuidedOnboarding() {
    const { data: session, update } = useSession();
    
    // Tillfälligt internt steg för UI-flöden som inte är direkt kopplade till session-data (t.ex. 'terms' och 'security').
    const [uiStep, setUiStep] = useState<OnboardingStep | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [hasAgreed, setHasAgreed] = useState(false);

    // Härled det primära steget från sessionen.
    const mainStep = determineCurrentStep(session);
    // Använd det tillfälliga UI-steget om det är satt, annars det primära steget.
    const step = uiStep || mainStep;

    const handleCompanyInfoSubmit = async (companyName: string) => {
        setError(null);
        startTransition(async () => {
            const result = await completeOnboardingStep(1, { companyName });
            if (result.success) {
                // Uppdatera sessionen. Den nya arkitekturen kommer automatiskt att visa rätt steg efter uppdatering.
                await update({ companyName });
                setUiStep('welcome'); // Gå till välkomstskärmen manuellt.
            } else {
                setError(result.error || 'Kunde inte spara företagsinformation.');
            }
        });
    };

    const handleCreateStructure = () => {
        if (!hasAgreed) {
            setError("Du måste godkänna villkoren för att fortsätta.");
            return;
        }
        setUiStep('creating');
        setError(null);
        startTransition(async () => {
            const result = await completeOnboardingStep(2, {});
            if (result.success) {
                await update({ 
                    driveRootFolderId: result.driveRootFolderId,
                    driveRootFolderUrl: result.driveRootFolderUrl
                });
                // Låt den primära steg-logiken ta över för att visa 'success'.
                setUiStep(null);
            } else {
                setError(result.error || 'Något gick fel vid skapande av mappstruktur.');
                setUiStep('terms');
            }
        });
    };

    const handleCompleteOnboarding = () => {
        startTransition(async () => {
            const result = await completeOnboardingStep(4, {});
            if (result.success) {
                 await update({ onboardingComplete: true });
                 window.location.href = '/dashboard';
            } else {
                setError("Kunde inte slutföra onboarding. Kontakta support.");
            }
        });
    };

    const ErrorDisplay = ({ message }: { message: string }) => (
        <div className="mt-4 p-4 bg-status-red/10 border border-status-red rounded-lg flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-status-red flex-shrink-0" />
            <p className="text-sm text-status-red">{message}</p>
        </div>
    );

    if (isPending && step !== 'creating') {
        return <LoadingSpinner />;
    }

    const renderContent = () => {
        switch (step) {
            case 'companyInfo':
                return <CompanyNameInput onSubmit={handleCompanyInfoSubmit} error={error} isPending={isPending} />;

            case 'welcome':
                return (
                    <div className="animate-fade-in">
                        <h1 className="text-4xl font-bold text-text-primary">Välkommen ombord, {session?.user?.name?.split(' ')[0] || ''}!</h1>
                        <p className="mt-4 text-lg text-text-secondary">
                           Jag är ByggPilot, din nya digitala kollega. Mitt jobb är att eliminera ditt papperskaos genom att automatisera administrationen direkt i ditt befintliga Google Workspace.
                        </p>
                        <div className="mt-8">
                            <button onClick={() => setUiStep('terms')} className="w-full flex items-center justify-center gap-3 bg-accent-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50">
                                Starta konfigurationen <ArrowRightIcon className='h-5 w-5'/>
                            </button>
                            <button onClick={() => setUiStep('security')} className="w-full text-center mt-4 text-sm text-accent-blue hover:text-blue-400 py-2">
                                Mer om säkerheten
                            </button>
                        </div>
                    </div>
                );
            
            case 'terms':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3">
                            <DocumentPlusIcon className="h-10 w-10 text-accent-blue" />
                            <h2 className="text-3xl font-bold text-text-primary">Skapa mappstruktur</h2>
                        </div>
                         <p className="mt-4 text-text-secondary">
                           Som ett första steg skapar jag en standardiserad mappstruktur i din Google Drive för <strong className='font-bold text-accent-blue'>{session?.user?.companyName}</strong>. Detta lägger grunden för automatiserad dokumenthantering. Ingen data raderas.
                        </p>
                        <div className="mt-6 p-4 bg-background-secondary rounded-lg border border-border-primary space-y-4">
                            <div className="flex items-start">
                                <input id="agree" name="agree" type="checkbox" checked={hasAgreed} onChange={() => setHasAgreed(!hasAgreed)} className="h-6 w-6 mt-1 bg-gray-700 border-gray-600 rounded text-accent-blue focus:ring-accent-blue cursor-pointer" />
                                <label htmlFor="agree" className="ml-3 block text-sm text-text-secondary">
                                    Jag förstår att ByggPilot kommer att skapa en ny mapp, <strong className="font-semibold">"ByggPilot - {session?.user?.companyName}"</strong>, med undermappar i min anslutna Google Drive.
                                </label>
                            </div>
                        </div>
                        {error && <ErrorDisplay message={error} />}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                           <button onClick={() => setUiStep('welcome')} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                                Tillbaka
                            </button>
                            <button onClick={handleCreateStructure} disabled={!hasAgreed || isPending} className="w-full flex items-center justify-center gap-3 bg-accent-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50">
                                {isPending ? 'Skapar...' : 'Ja, skapa struktur'}
                            </button>
                        </div>
                    </div>
                )

            case 'security':
                 return (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3">
                           <ShieldCheckIcon className="h-10 w-10 text-accent-blue"/>
                           <h2 className="text-3xl font-bold text-text-primary">Säkerhet & Transparens</h2>
                        </div>
                        <div className="mt-4 space-y-4 text-text-secondary">
                            <p><strong>Dina data är dina.</strong> Allt stannar säkert i ditt eget Google Drive. ByggPilot lagrar inga filer.</p>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                                <li>Vi använder Googles egen säkra inloggningsteknik (OAuth 2.0).</li>
                                <li>Du kan när som helst ta bort åtkomsten via dina Google-inställningar.</li>
                                <li>All din data skyddas av Googles infrastruktur.</li>
                                <li><strong class="text-accent-blue">Viktigt:</strong> Vi begär endast behörighet att hantera de filer appen själv skapar (<code class="text-xs bg-gray-700 p-1 rounded">drive.file</code>), inte hela din Drive.</li>
                            </ul>
                        </div>
                        <div className="mt-8">
                            <button onClick={() => setUiStep('welcome')} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
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
                        <CheckCircleIcon className="h-20 w-20 text-green-400 mx-auto" />
                        <h1 className="mt-6 text-4xl font-bold text-text-primary">Kontoret är redo!</h1>
                        <p className="mt-4 text-lg text-text-secondary">
                           En grundläggande mappstruktur har skapats i din Google Drive för <strong className='font-bold text-accent-blue'>{session?.user?.companyName}</strong>.
                        </p>
                        <div className="mt-8 flex flex-col gap-4">
                            {session?.user?.driveRootFolderUrl && (
                                <a
                                    href={session.user.driveRootFolderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-3 bg-accent-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                                >
                                    Öppna Google Drive-mappen <ArrowTopRightOnSquareIcon className='h-5 w-5'/>
                                </a>
                            )}
                            <button 
                                onClick={handleCompleteOnboarding} 
                                disabled={isPending} 
                                className="w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                            >
                                {isPending ? 'Slutför...' : 'Gå till Översikten'} <ArrowRightIcon className='h-5 w-5'/>
                            </button>
                             {error && <ErrorDisplay message={error} />}
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="w-full h-full flex flex-col justify-center p-8 md:p-12 bg-background-secondary/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full">
                 {renderContent()}
            </div>
        </div>
    )
}
