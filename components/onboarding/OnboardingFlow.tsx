
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Step_Welcome from './Step_Welcome';
import Step_SecurityInfo from './Step_SecurityInfo';
import Step_CreateStructure from './Step_CreateStructure';
import Step_Success from './Step_Success';

// =================================================================================
// ONBOARDING-FLÖDE V4.1 - RENsad STYLING
// LÖSNING: Den omslutande `div`-en har inte längre egna styling-klasser. Ansvaret
// för layout och bakgrund ligger nu helt på den överordnade sid-komponenten.
// =================================================================================

export type OnboardingStep = 'welcome' | 'security' | 'creating' | 'success';

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [companyName, setCompanyName] = useState<string>(''); 
  const [error, setError] = useState<string | null>(null);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateStructure = async () => {
    setCurrentStep('creating');
    setError(null);

    try {
      const response = await fetch('/api/onboarding/create-drive-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ett okänt serverfel uppstod.');
      }
      
      setFolderUrl(data.folderUrl);
      setCurrentStep('success');

    } catch (err: any) {
      console.error("Fel vid anrop till /api/onboarding/create-drive-structure:", err);
      setError(err.message);
      setCurrentStep('welcome');
    }
  };
  
  const handleComplete = () => {
      router.push('/dashboard?tour=true');
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Step_Welcome 
                  userName={session?.user?.name || ''} 
                  companyName={companyName}             
                  setCompanyName={setCompanyName}     
                  onProceed={handleCreateStructure} 
                  onSkip={() => router.push('/dashboard')} 
                  onShowSecurity={() => setCurrentStep('security')} 
                  error={error}
                />;
      case 'security':
        return <Step_SecurityInfo onProceed={handleCreateStructure} onGoBack={() => setCurrentStep('welcome')} />;
      case 'creating':
        return <Step_CreateStructure />;
      case 'success':
        return <Step_Success 
                  onComplete={handleComplete} 
                  companyName={companyName} 
                  folderUrl={folderUrl}      
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
