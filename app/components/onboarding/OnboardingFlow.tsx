
'use client';

import React, { useState } from 'react';
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
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateStructure = async () => {
    setCurrentStep('creating');
    setError(null); // Återställ eventuella tidigare fel

    try {
      const response = await fetch('/api/onboarding/create-drive-structure', {
        method: 'POST',
      });

      // Försök att parsa JSON-svaret oavsett om anropet lyckades eller ej
      const result = await response.json();

      if (!response.ok) {
        // Om servern svarar med ett fel, använd felmeddelandet från serverns JSON
        const errorMessage = result.error || `Ett okänt serverfel inträffade (status: ${response.status}).`;
        throw new Error(errorMessage);
      }

      if(result.success && result.folderUrl) {
        setFolderUrl(result.folderUrl); 
        setCurrentStep('success');
      } else {
        // Om anropet var "ok" men datan saknas
        throw new Error(result.error || 'Kunde inte hämta mappens URL från servern trots ett lyckat svar.');
      }
    } catch (err: any) {
      console.error("[Onboarding Error]", err);
      // Sätt det extraherade eller genererade felmeddelandet
      setError(err.message || "Ett oväntat fel inträffade. Kontrollera din internetanslutning.");
      setCurrentStep('welcome'); // Gå tillbaka till välkomststeget för att visa felet
    }
  };
  
  const handleComplete = () => {
      router.push('/dashboard?tour=true');
  };
  
  const renderStep = () => {
    // Flyttade felhanteringen in i 'welcome' steget för en bättre användarupplevelse
    switch (currentStep) {
      case 'welcome':
        return <Step_Welcome 
                  userName={session?.user?.name || ''} 
                  onProceed={handleCreateStructure} 
                  onSkip={() => router.push('/dashboard')} 
                  onShowSecurity={() => setCurrentStep('security')} 
                  error={error} // Skicka med felmeddelandet till komponenten
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
