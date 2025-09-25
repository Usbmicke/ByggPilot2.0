
'use client';

import React, { useState, useEffect, useTransition } from 'react'; // Importera useTransition
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CompanyInfoForm from '@/app/components/auth/CompanyInfoForm';
import OnboardingFlow from '@/app/components/onboarding/OnboardingFlow';
import OnboardingModal from '@/app/components/OnboardingModal';
import Image from 'next/image';
import { updateUserTermsStatus } from '@/app/actions/userActions';

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition(); // Skapa transition-hook
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  const [hasAcknowledgedTerms, setHasAcknowledgedTerms] = useState(false);

  // Synkronisera state med sessionen när den laddas eller uppdateras
  useEffect(() => {
    if (session?.user?.termsAccepted) {
        setHasAcknowledgedTerms(true);
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><p>Laddar session...</p></div>;
  }

  if (status === 'unauthenticated') {
    router.replace('/');
    return null;
  }

  const handleTermsAcknowledged = async () => {
    if (!session?.user?.id) return;

    // KORRIGERING: Använd startTransition för att förhindra felaktig form-hantering
    startTransition(async () => {
      const result = await updateUserTermsStatus(session.user.id, true);
      if (result.success) {
        await update(); // Tvinga session-uppdatering
      } else {
        console.error("Fel vid uppdatering av villkor:", result.error);
        // Kasta ett fel för att modalen ska kunna hantera det
        throw new Error(result.error || 'Kunde inte spara villkors-status.');
      }
    });
  };

  const handleFormSuccess = () => {
    setHasCompletedForm(true);
  };

  // Bestäm om modalen ska visas. Explicit kontroll är mer robust.
  const showModal = status === 'authenticated' && !session.user.termsAccepted;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      
      {showModal && session?.user?.name && (
        <OnboardingModal 
          userName={session.user.name}
          onAcknowledge={handleTermsAcknowledged} 
        />
      )}

      {/* Visa resten av sidan endast om villkoren är godkända */}
      {!showModal && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
              <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={60} height={60} className="mx-auto mb-4"/>
              {!hasCompletedForm ? (
                <>
                  <h1 className="text-3xl font-bold text-white">Välkommen till ByggPilot!</h1>
                  <p className="text-gray-400 mt-2">Bara ett steg kvar. Fyll i din företagsinformation för att komma igång.</p>
                </>
              ) : null}
          </div>
          
          {!hasCompletedForm ? 
            <CompanyInfoForm onSuccess={handleFormSuccess} /> : 
            <OnboardingFlow />
          }

          {!hasCompletedForm && (
            <p className="text-center text-xs text-gray-500 mt-6">
              Denna information används för att automatiskt skapa offerter, fakturor och andra dokument åt dig.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
