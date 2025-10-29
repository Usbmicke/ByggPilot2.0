
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, ShieldCheckIcon, DocumentPlusIcon, FolderIcon } from '@heroicons/react/24/solid';
import CompanyNameInput from '@/components/onboarding/CompanyNameInput';
import { completeOnboardingStep } from '@/onboarding/actions';

type OnboardingStep = 'companyInfo' | 'structure' | 'success';
type TransientView = 'welcome' | 'terms' | 'security';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300 animate-pulse">Arbetar...</p>
    </div>
);

export default function GuidedOnboarding() {
    const { data: session, update } = useSession();
    const router = useRouter();
    
    const [view, setView] = useState<TransientView>('welcome');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [hasAgreed, setHasAgreed] = useState(false);

    const handleCompanyInfoSubmit = (companyName: string) => {
        setError(null);
        startTransition(async () => {
            const result = await completeOnboardingStep(1, { companyName });
            if (result.success && result.data) {
                await update({ user: { companyName: result.data.companyName } });
            } else {
                setError(result.error || 'Något gick fel.');
            }
        });
    };

    const handleCreateStructure = () => {
        if (!hasAgreed) return;
        setError(null);
        startTransition(async () => {
            const result = await completeOnboardingStep(2, {});
            if (result.success) {
                await update({ 
                    user: { 
                        driveRootFolderId: result.driveRootFolderId,
                        driveRootFolderUrl: result.driveRootFolderUrl 
                    }
                });
            } else {
                setError(result.error || 'Kunde inte skapa mappstrukturen.');
            }
        });
    };

    const handleFinalizeOnboarding = () => {
        startTransition(async () => {
            const result = await completeOnboardingStep(4, {});
            if (result.success) {
                await update({ user: { onboardingComplete: true }});
                router.push('/dashboard');
            } else {
                setError('Kunde inte slutföra onboardingen. Prova att ladda om sidan.');
            }
        });
    };
    
    const renderContent = () => {
        if (!session?.user) return <LoadingSpinner />;
        if (isPending) return <LoadingSpinner />;

        const onboardingStep = session.user.onboardingComplete ? 'success' : (!session.user.companyName ? 'companyInfo' : (!session.user.driveRootFolderId ? 'structure' : 'success'));

        switch (onboardingStep) {
            case 'companyInfo':
                return <CompanyNameInput onSubmit={handleCompanyInfoSubmit} error={error} isPending={isPending} />;

            case 'structure':
                switch (view) {
                    case 'welcome': return (
                        <div className="animate-fade-in"><h1 className="text-4xl font-bold">Välkommen, {session.user.name?.split(' ')[0]}!</h1><p className="mt-4 text-lg text-gray-300">Jag är ByggPilot. Låt oss sätta upp ditt konto.</p><div className="mt-8"><button onClick={() => setView('terms')} className="w-full flex items-center justify-center gap-3 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">Starta konfiguration</button></div></div>
                    );
                    case 'terms': return (
                        <div className="animate-fade-in"><div className="flex items-center gap-3"><DocumentPlusIcon className="h-10 w-10 text-cyan-400"/><h2 className="text-3xl font-bold">Skapa mappstruktur</h2></div><p className="mt-4 text-gray-300">Jag skapar en mappstruktur i din Drive för <strong className='font-bold'>{session.user.companyName}</strong>.</p><div className="mt-6"><div className="flex items-start"><input id="agree" type="checkbox" checked={hasAgreed} onChange={() => setHasAgreed(!hasAgreed)} className="h-6 w-6 rounded" /><label htmlFor="agree" className="ml-3 text-sm">Jag förstår att en ny mapp skapas.</label></div></div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<div className="mt-8 flex gap-4"><button onClick={() => setView('welcome')} className="w-full bg-gray-600 font-bold py-3 px-6 rounded-lg">Tillbaka</button><button onClick={handleCreateStructure} disabled={!hasAgreed || isPending} className="w-full bg-cyan-600 font-bold py-3 px-6 rounded-lg disabled:opacity-50">Ja, skapa struktur</button></div></div>
                    );
                    default: setView('welcome'); return null;
                }

            case 'success':
                return (
                    <div className="animate-fade-in text-center">
                        <CheckCircleIcon className="h-20 w-20 text-green-400 mx-auto" />
                        <h1 className="mt-6 text-4xl font-bold">Mappstruktur Skapad!</h1>
                        <p className="mt-4 text-lg text-gray-300">Din grundinstallation är klar. Du hittar din nya mapp i Google Drive.</p>
                        
                        {/* DEN AVGÖRANDE, KORRIGERADE LÄNKEN */}
                        {session.user.driveRootFolderUrl && (
                            <div className="mt-6">
                                <a href={session.user.driveRootFolderUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                    <FolderIcon className="h-6 w-6" />
                                    Öppna "ByggPilot - {session.user.companyName}"
                                </a>
                            </div>
                        )}

                        <div className="mt-8">
                            <button onClick={handleFinalizeOnboarding} disabled={isPending} className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg">{isPending ? 'Slutför...' : 'Gå till Översikten'} <ArrowRightIcon className='h-5 w-5'/></button>
                        </div>
                    </div>
                );

            default:
                return <LoadingSpinner />;
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-center p-8 bg-gray-900/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full">
                {renderContent()}
            </div>
        </div>
    );
}
