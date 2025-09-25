
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CompanyInfoForm from '@/app/components/auth/CompanyInfoForm';
import OnboardingFlow from '@/app/components/onboarding/OnboardingFlow';
import OnboardingModal from '@/app/components/OnboardingModal'; // Återanvänder denna!
import Image from 'next/image';
import { updateUserTermsStatus } from '@/app/actions/userActions';

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // Ny state för att hantera de olika delarna av onboardingen
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  const [hasAcknowledgedTerms, setHasAcknowledgedTerms] = useState(session?.user?.termsAccepted || false);

  useEffect(() => {
    // Om sessionen uppdateras (t.ex. efter villkorsgodkännande), uppdatera vår state
    setHasAcknowledgedTerms(session?.user?.termsAccepted || false);
  }, [session]);

  // Om sessionen laddas, visa en enkel laddningsskärm.
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Laddar session...</p>
      </div>
    );
  }

  // Om användaren av någon anledning inte är autentiserad, skicka tillbaka till startsidan.
  if (status === 'unauthenticated') {
    router.replace('/');
    return null;
  }

  const handleTermsAcknowledged = async () => {
    if (!session?.user?.id) return;
    // Anropa server action för att uppdatera användaren i databasen
    const result = await updateUserTermsStatus(session.user.id, true);
    if (result.success) {
      // Tvinga en session-uppdatering för att hämta den nya 'termsAccepted'-statusen
      await update(); 
    } else {
      // Hantera eventuellt fel. Kasta ett fel så att OnboardingModal kan fånga det.
      throw new Error(result.error || 'Kunde inte spara villkors-status.');
    }
  };

  // Denna funktion körs när CompanyInfoForm är framgångsrikt inskickat.
  // Istället för att omdirigera, signalerar den nu att det är dags för nästa steg.
  const handleFormSuccess = () => {
    setHasCompletedForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      
      {/* STEG 0: Godkänn villkor (om inte redan gjort) */}
      {!hasAcknowledgedTerms && session?.user?.name && (
        <OnboardingModal 
          userName={session.user.name}
          onAcknowledge={handleTermsAcknowledged} 
        />
      )}

      {/* Visa detta endast om villkoren är godkända */}
      {hasAcknowledgedTerms && (
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
          
          {/* STEG 1: Företagsinformation */}
          {!hasCompletedForm ? 
            <CompanyInfoForm onSuccess={handleFormSuccess} /> : 
            null
          }

          {/* STEG 2: Interaktiv Onboarding-flöde */}
          {hasCompletedForm ? 
            <OnboardingFlow /> : 
            null 
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
