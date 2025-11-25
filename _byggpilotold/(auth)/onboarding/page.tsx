
import { Suspense } from 'react';
import GuidedOnboarding from '@/app/_components/onboarding/GuidedOnboarding';

// =================================================================================
//  LADDNINGS-SIDA FÖR ONBOARDING (VERSION 2.1 - MED SUSPENSE)
// =================================================================================

const LoadingFallback = () => (
  <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-900 text-neutral-200">
    <h1 className="text-2xl font-bold">Framtiden laddar...</h1>
    <p className="mt-2 text-neutral-400">Vi förbereder din copilots landningsbana. Ett ögonblick.</p>
  </div>
);

// =================================================================================
// ONBOARDING PAGE V2.1
// =================================================================================
// ANVÄNDER NU REACT SUSPENSE
// Detta visar en informativ laddningssida (LoadingFallback) medan den 
// tunga GuidedOnboarding-komponenten och dess data hämtas i bakgrunden. 
// Detta ger användaren omedelbar feedback istället för en blank sida.
// =================================================================================

export default function OnboardingPage() {
  return (
    <main className="h-screen w-screen">
      <Suspense fallback={<LoadingFallback />}>
        <GuidedOnboarding />
      </Suspense>
    </main>
  );
}
