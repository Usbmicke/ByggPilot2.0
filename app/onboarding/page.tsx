
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GuidedOnboarding } from '@/app/components/onboarding/GuidedOnboarding';
import { OnboardingAnimation } from '@/app/components/onboarding/OnboardingAnimation';

/**
 * GULDSTANDARD ONBOARDING
 * Denna sida representerar den första interaktionen en ny användare har med ByggPilot.
 * Den är designad för att vara vacker, förtroendeingivande och värdeskapande från första sekund.
 * 
 * Vänster sida: En dynamisk och inspirerande animation som subtilt visar kraften i ByggPilot.
 * Höger sida: En lugn, guidad resa som tar användaren i handen, bygger förtroende och levererar omedelbart värde.
 */
export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Om sessionen fortfarande laddas, visa en enkel laddningsskärm.
  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><p>Laddar session...</p></div>;
  }

  // Om användaren inte är autentiserad, skicka dem till startsidan.
  if (status === 'unauthenticated') {
    router.replace('/');
    return null;
  }

  // Om användaren redan har slutfört onboardingen, skicka dem direkt till dashboarden.
  // Detta förhindrar att de ser onboardingen igen.
  if (session?.user?.onboardingComplete) {
      router.replace('/dashboard');
      return null;
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
            {/* VÄNSTER SIDA: Animation & Inspiration */}
            <div className="hidden md:flex relative">
                <OnboardingAnimation />
            </div>

            {/* HÖGER SIDA: Guidad Tur & Handling */}
            <div>
                <GuidedOnboarding />
            </div>
        </div>
    </main>
  );
}
