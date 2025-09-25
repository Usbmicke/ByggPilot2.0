
'use client';
import CompanyInfoForm from '@/app/components/auth/CompanyInfoForm';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Sida för "onboarding" av nya användare.
 */
export default function OnboardingPage() {
  const { user, loading, userClaims } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Vänta tills vi vet status

    // Om användaren inte är inloggad, skicka till login
    if (!user) {
      router.push('/login');
      return;
    }

    // Om användaren redan har slutfört onboarding, skicka till dashboard
    if (userClaims?.onboardingComplete) {
      toast.success('Välkommen tillbaka!');
      router.push('/dashboard');
    }

  }, [user, loading, userClaims, router]);

  const handleOnboardingSuccess = () => {
    // Tvinga en uppdatering av användarens token för att få med nya claims
    user?.getIdToken(true);
    router.push('/dashboard');
  };

  // Visa en laddningsindikator medan vi verifierar användaren
  if (loading || !user || userClaims?.onboardingComplete) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Omdirigerar...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <div className="w-full max-w-md animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-2">Välkommen till ByggPilot!</h1>
            <p className="text-gray-400 text-center mb-8">Vi behöver bara lite information för att komma igång.</p>
            <CompanyInfoForm onSuccess={handleOnboardingSuccess} />
        </div>
    </main>
  );
}
