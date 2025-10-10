
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Step_Welcome from './Step_Welcome';
import Step_SecurityInfo from './Step_SecurityInfo';
import Step_CreateStructure from './Step_CreateStructure';
import Step_Success from './Step_Success';

// =================================================================================
// GULDSTANDARD: ONBOARDING-FLÖDE V3.0 - SLUTGILTIG VERSION
// Återställer det riktiga API-anropet och tar bort den simulerade funktionen.
// Detta anropar den nyskapade backend-logiken för att skapa mappstrukturen i Google Drive.
// Hanterar även felmeddelanden från servern och visar dem för användaren.
// =================================================================================

export type OnboardingStep = 'welcome' | 'security' | 'creating' | 'success';

interface OnboardingFlowProps {
    companyName: string;
}

export default function OnboardingFlow({ companyName }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateStructure = async () => {
    setCurrentStep('creating');
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Om servern svarar med ett fel, fånga upp det.
        throw new Error(data.error || 'Ett okänt serverfel uppstod.');
      }
      
      // Använd den riktiga URL:en från servern
      setFolderUrl(data.folderUrl);
      setCurrentStep('success');

    } catch (err: any) {
      console.error("Fel vid anrop till /api/onboarding:", err);
      // Sätt ett felmeddelande och gå tillbaka till första steget för att visa det.
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
                  onProceed={handleCreateStructure} 
                  onSkip={() => router.push('/dashboard')} 
                  onShowSecurity={() => setCurrentStep('security')} 
                  error={error} // Skicka med felet för att visa det i UI
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
