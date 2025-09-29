
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CompanyInfoForm from '@/app/components/auth/CompanyInfoForm';
import OnboardingFlow from '@/app/components/onboarding/OnboardingFlow';
import OnboardingModal from '@/app/components/OnboardingModal';
import Image from 'next/image';
import { updateUserTermsStatus } from '@/app/actions/userActions';
import { XIcon } from 'lucide-react';

const CancelOnboardingModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void; }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full m-4 text-center">
      <h2 className="text-2xl font-bold text-white">Är du säker?</h2>
      <p className="text-gray-300 mt-4">Dina företagsinställningar kommer inte att sparas. Du kan slutföra detta senare från din dashboard.</p>
      <div className="mt-8 flex gap-4">
        <button onClick={onCancel} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Avbryt
        </button>
        <button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Ja, gå till Dashboard
        </button>
      </div>
    </div>
  </div>
);

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition();
  const [companyName, setCompanyName] = useState<string>("");
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const termsAccepted = session?.user?.termsAccepted === true;

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><p>Laddar session...</p></div>;
  }

  if (status === 'unauthenticated') {
    router.replace('/');
    return null;
  }

  const handleTermsAcknowledged = async () => {
    if (!session?.user?.id) return;
    startTransition(async () => {
      const result = await updateUserTermsStatus(session.user.id, true);
      if (result.success) {
        await update();
      } else {
        throw new Error(result.error || 'Kunde inte spara villkors-status.');
      }
    });
  };

  const handleFormSuccess = (name: string) => {
    setCompanyName(name);
    setHasCompletedForm(true);
  };
  
  const handleCancelConfirm = () => {
      router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
      
      {!termsAccepted && session?.user?.name && (
        <OnboardingModal 
          userName={session.user.name}
          onAcknowledge={handleTermsAcknowledged} 
        />
      )}

      {showCancelModal && (
          <CancelOnboardingModal onConfirm={handleCancelConfirm} onCancel={() => setShowCancelModal(false)} />
      )}

       <button onClick={() => setShowCancelModal(true)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-[50]">
          <XIcon size={24} />
      </button>

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
            <OnboardingFlow companyName={companyName} />
          }

          {!hasCompletedForm && (
            <p className="text-center text-xs text-gray-500 mt-6">
              Informationen används för att automatiskt skapa offerter, fakturor och dokument.
            </p>
          )}
        </div>
    </div>
  );
}
