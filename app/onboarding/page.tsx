
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CompanyInfoForm from '@/app/components/auth/CompanyInfoForm';
import Image from 'next/image';

// Denna sida är den nya, dedikerade landningsplatsen för en ny användare.
// Den ger en ren och fokuserad upplevelse för att slutföra registreringen.

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // När formuläret har fyllts i och skickats, omdirigera till instrumentpanelen.
  const handleSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={60} height={60} className="mx-auto mb-4"/>
            <h1 className="text-3xl font-bold text-white">Välkommen till ByggPilot!</h1>
            <p className="text-gray-400 mt-2">Bara ett steg kvar. Fyll i din företagsinformation för att komma igång.</p>
        </div>
        
        <CompanyInfoForm onSuccess={handleSuccess} />

        <p className="text-center text-xs text-gray-500 mt-6">
            Denna information används för att automatiskt skapa offerter, fakturor och andra dokument åt dig.
        </p>
      </div>
    </div>
  );
}
