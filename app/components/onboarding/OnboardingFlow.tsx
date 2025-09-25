
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Step_Welcome from './Step_Welcome';
import Step_SecurityInfo from './Step_SecurityInfo';
import Step_CreateStructure from './Step_CreateStructure';
import Step_Success from './Step_Success';

// Definition av de olika stegen i flödet
export type OnboardingStep = 'welcome' | 'security' | 'creating' | 'success';

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [error, setError] = useState<string | null>(null);
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
      if(result.success) {
        setCurrentStep('success');
      } else {
        throw new Error(result.error || 'Ett okänt serverfel inträffade.');
      }
    } catch (err) {
      setError(err.message);
      // Om det blir ett fel, stanna på "creating"-steget men visa ett felmeddelande.
      // I en framtida version kan vi ha ett dedikerat fel-steg.
    }
  };
  
  const renderStep = () => {
    // Visa ett felmeddelande om ett sådant finns
    if (error) {
      return (
        <div className="text-center text-red-400">
          <p>Kunde inte skapa mappstrukturen:</p>
          <p className="font-mono text-sm">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="mt-4 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Gå till Dashboard</button>
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
        return <Step_SecurityInfo 
                  onProceed={handleCreateStructure} 
                  onGoBack={() => setCurrentStep('welcome')} 
                />;
      case 'creating':
        return <Step_CreateStructure />;
      case 'success':
        return <Step_Success onComplete={() => router.push('/dashboard')} />;
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
