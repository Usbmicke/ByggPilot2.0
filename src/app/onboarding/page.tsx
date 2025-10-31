
import { GuidedOnboarding } from '@/components/onboarding/GuidedOnboarding';
import { getAuth } from '@/lib/config/authOptions';
import { redirect } from 'next/navigation';

// =================================================================================
// ONBOARDING PAGE V1.0
// =================================================================================
// Denna sida fungerar som en "host" för GuidedOnboarding-komponenten.

export default async function OnboardingPage() {
  // Även om middleware hanterar det mesta, är detta en extra säkerhetskontroll.
  const session = await getAuth();
  if (session?.user?.hasCompletedOnboarding) {
    redirect('/dashboard');
  }

  return (
    <main className="h-screen w-screen">
      <GuidedOnboarding />
    </main>
  );
}
