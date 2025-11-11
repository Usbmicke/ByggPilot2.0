
import GuidedOnboarding from '@/components/onboarding/GuidedOnboarding';

// =================================================================================
// ONBOARDING PAGE V2.0
// =================================================================================
// Denna sida fungerar som en "host" för GuidedOnboarding-komponenten.
// All logik för att hämta användardata, hantera state och omdirigera
// har flyttats in i GuidedOnboarding-komponenten och dess underliggande hooks
// för att följa den nya Genkit-arkitekturen.

export default function OnboardingPage() {
  return (
    <main className="h-screen w-screen">
      <GuidedOnboarding />
    </main>
  );
}
