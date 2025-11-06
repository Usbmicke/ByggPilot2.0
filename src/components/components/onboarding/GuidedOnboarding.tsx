
'use client';

import React, { useState, useTransition, FC } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, FolderIcon, DocumentPlusIcon } from '@heroicons/react/24/solid';
import { completeOnboardingStep } from '../../onboarding/actions'; // KORRIGERAD IMPORT

// --- Subkomponenter för Tydlighet ---

const LoadingSpinner: FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300 animate-pulse">Arbetar...</p>
    </div>
);

interface CompanyNameInputProps {
    onSubmit: (companyName: string) => void;
    error: string | null;
    isPending: boolean;
}

const CompanyNameInput: FC<CompanyNameInputProps> = ({ onSubmit, error, isPending }) => {
    const [companyName, setCompanyName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (companyName.trim()) {
            onSubmit(companyName.trim());
        }
    };
    return (
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Välkommen till ByggPilot!</h1>
                <p className="mt-2 text-gray-300">För att komma igång, vad heter ditt företag?</p>
            </div>
            <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Bygg AB"
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
                disabled={isPending}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={!companyName.trim() || isPending} className="w-full flex items-center justify-center gap-3 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50">
                {isPending ? 'Sparar...' : 'Fortsätt'}
            </button>
        </form>
    );
};


// --- Huvudkomponent: GuidedOnboarding (Guldstandard) ---

export default function GuidedOnboarding() {
    const { data: session, update } = useSession();
    const router = useRouter();
    
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // === Steg 1: Företagsinformation ===
    const handleCompanyInfoSubmit = (companyName: string) => {
        setError(null);
        startTransition(async () => {
            const result = await completeOnboardingStep(1, { companyName });
            if (result.success) {
                // HÄRDAD LOGIK: Uppdatera sessionen med det lokala statet, invänta resultatet.
                await update({ user: { companyName } });
            } else {
                setError(result.error || 'Något gick fel med att spara företagsnamnet.');
            }
        });
    };

    // === Steg 2: Skapa Mappstruktur ===
    const handleCreateStructure = () => {
        setError(null);
        startTransition(async () => {
            const result = await completeOnboardingStep(2, {});
            if (result.success && result.driveRootFolderId && result.driveRootFolderUrl) {
                // HÄRDAD LOGIK: Uppdatera sessionen med ALL data från servern, invänta resultatet.
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

    // === Steg 3: Slutförande & Omdirigering ===
    const handleFinalizeOnboarding = () => {
        startTransition(async () => {
            const result = await completeOnboardingStep(4, {}); // Steg 4 enligt action
            if (result.success) {
                // HÄRDAD LOGIK: Invänta session-uppdatering INNAN omdirigering.
                await update({ user: { onboardingComplete: true }});
                router.push('/dashboard');
            } else {
                setError('Kunde inte slutföra onboardingen. Prova att ladda om sidan.');
            }
        });
    };
    
    // === Arkitektonisk Rendering: Tydlig och Robust Steg-logik ===
    const renderCurrentStep = () => {
        if (!session?.user) return <LoadingSpinner />;
        
        const { companyName, driveRootFolderId, onboardingComplete } = session.user;

        if (onboardingComplete) {
            // Skulle inte hända pga middleware, men som en failsafe.
            router.push('/dashboard');
            return <LoadingSpinner />;
        }
        
        if (!companyName) {
            return <CompanyNameInput onSubmit={handleCompanyInfoSubmit} error={error} isPending={isPending} />;
        }

        if (!driveRootFolderId) {
            return (
                 <div className="animate-fade-in space-y-6 text-center">
                    <DocumentPlusIcon className="h-16 w-16 text-cyan-400 mx-auto"/>
                    <h1 className="text-3xl font-bold">Skapa din Projektmapp</h1>
                    <p className="text-gray-300">
                        Jag kommer nu att skapa en säker, delad mappstruktur i din Google Drive för
                        <strong className="block text-white mt-1">{session.user.companyName}</strong>.
                    </p>
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                    <button onClick={handleCreateStructure} disabled={isPending} className="w-full bg-cyan-600 font-bold py-3 px-6 rounded-lg disabled:opacity-50">
                        {isPending ? 'Skapar struktur...' : 'Ja, skapa mappstruktur'}
                    </button>
                </div>
            );
        }

        return (
            <div className="animate-fade-in text-center space-y-6">
                <CheckCircleIcon className="h-20 w-20 text-green-400 mx-auto" />
                <h1 className="text-4xl font-bold">Allt är klart!</h1>
                <p className="text-lg text-gray-300">Din grundinstallation är färdig. Din projektmapp har skapats i Google Drive.</p>
                
                {session.user.driveRootFolderUrl && (
                    <a href={session.user.driveRootFolderUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        <FolderIcon className="h-6 w-6" />
                        Öppna mappen
                    </a>
                )}

                <button onClick={handleFinalizeOnboarding} disabled={isPending} className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg">
                    {isPending ? 'Omdirigerar...' : 'Gå till Översikten'} 
                    <ArrowRightIcon className='h-5 w-5'/>
                </button>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col justify-center p-8 bg-gray-900/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full">
                {isPending ? <LoadingSpinner /> : renderCurrentStep()}
            </div>
        </div>
    );
}
