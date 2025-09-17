'use client';
import CompanyInfoForm from '@/app/components/auth/CompanyInfoForm';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Sida för "onboarding" av nya användare.
 * Användare omdirigeras hit för att fylla i företagsinformation.
 */
export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Om vi har laddat klart och det inte finns någon användare, skicka till startsidan
    if (!loading && !user) {
      router.push('/');
    }
    // Om användaren redan har ett företag kopplat, skicka till dashboarden
    // (Logik för detta kommer att implementeras senare)
  }, [user, loading, router]);

  // Visa en laddningsindikator medan vi verifierar användaren
  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Laddar...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-2">Välkommen till ByggPilot!</h1>
            <p className="text-gray-400 text-center mb-8">Vi behöver bara lite information för att komma igång.</p>
            <CompanyInfoForm />
        </div>
    </main>
  );
}
