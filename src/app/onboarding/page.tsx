
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
// GULDSTANDARD-FIX: Importerar komponenterna korrekt som namngivna exporter.
import { GuidedOnboarding } from '@/components/onboarding/GuidedOnboarding';
import { OnboardingAnimation } from '@/components/onboarding/OnboardingAnimation';

/**
 * GULDSTANDARD ONBOARDING
 * Denna sida representerar den första interaktionen en ny användare har med ByggPilot.
 * Den är designad för att vara vacker, förtroendeingivande och värdeskapande från första sekund.
 */
export default function OnboardingPage() {
  const { data: session, status } = useSession();

  // Visa en laddningsskärm medan vi väntar på att sessionen ska initieras.
  // All omdirigeringslogik hanteras nu centralt av middleware.ts.
  if (status === 'loading' || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><p>Laddar...</p></div>;
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
