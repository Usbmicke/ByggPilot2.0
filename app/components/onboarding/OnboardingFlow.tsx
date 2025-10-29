
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Step_Welcome from './Step_Welcome';
import Step_SecurityInfo from './Step_SecurityInfo';
import Step_CreateStructure from './Step_CreateStructure';
import Step_Success from './Step_Success';

export type OnboardingStep = 'welcome' | 'security' | 'creating' | 'success';

interface OnboardingFlowProps {
    companyName: string;
}

export default function OnboardingFlow({ companyName }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [folderUrl, setFolderUrl] = useState<string | null>(null); // Ny state för mappens URL
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateStructure = async () => {
    setCurrentStep('creating');
    try {
      const response = await fetch('/api/onboarding/create-drive-structure', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Något gick fel på servern.');
      }

      const result = await response.json();
      if(result.success && result.folderUrl) {
        setFolderUrl(result.folderUrl); // Spara URL:en
        setCurrentStep('success');
      } else {
        throw new Error(result.error || 'Kunde inte hämta mappens URL från servern.');
      }
    // VÄRLDSKLASS-KORRIGERING: Korrekt hantering av 'unknown' feltyp.
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ett okänt fel inträffade.');
      }
    }
  };
  
  const handleComplete = () => {
      // Omdirigera till dashboarden, men med en parameter som indikerar att touren ska starta
      router.push('/dashboard?tour=true');
  };
  
  const renderStep = () => {
    if (error) {
      return (
        <div className="text-center text-red-400 bg-gray-800 p-8 rounded-lg border border-red-500/50">
          <h3 className="font-bold text-lg text-white">Kunde inte skapa mappstrukturen</h3>
          <p className="mt-2">{error}</p>
          <p className="mt-4 text-sm text-gray-300">Om problemet kvarstår, kontakta supporten via chatten på din dashboard.</p>
          <button onClick={() => router.push('/dashboard')} className="mt-6 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Gå till Dashboard</button>
        </div>
      );
    }
    
    switch (currentStep) {
      case 'welcome':
        return <Step_Welcome 
                  userName={session?.user?.name || ''} 
                  onProceed={handleCreateStructure} 
                  onSkip={() => router.push('/dashboard')} 
                  onShowSecurity={() => setCurrentStep('security')} 
                />;
      case 'security':
        return <Step_SecurityInfo onProceed={handleCreateStructure} onGoBack={() => setCurrentStep('welcome')} />;
      case 'creating':
        return <Step_CreateStructure />;
      case 'success':
        return <Step_Success 
                  onComplete={handleComplete} 
                  companyName={companyName} // Skicka med namnet
                  folderUrl={folderUrl}       // Skicka med URL:en
                />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {renderStep()}
    </div>
  );
}
