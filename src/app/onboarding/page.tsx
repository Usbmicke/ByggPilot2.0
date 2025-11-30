'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useGenkitMutation } from '@/hooks/useGenkitMutation';

export default function OnboardingPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

  // FIXAD: Omdirigerar nu till startsidan (/) istället för den raderade /login
  const { mutate, isPending, error, data } = useGenkitMutation('onboardingFlow');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/'); // Ändrad från /login till /
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await mutate({ displayName }, {
      onSuccess: () => {
        console.log('Onboarding successful! Redirecting to dashboard...');
        // Framtida steg: Omdirigera till en faktisk dashboard, t.ex. /dashboard
        router.replace('/'); 
      },
      onError: (err: any) => {
        console.error('Onboarding failed:', err);
      }
    });
  };

  // Medan vi verifierar inloggning, visa en laddningssida.
  if (isAuthLoading || !user) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
            <p>Verifierar inloggning...</p>
        </div>
    );
  }

  // När användaren är verifierad, visa formuläret.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">Slutför din profil</h1>
        <p className="text-center text-gray-400 mb-6">Välj ett visningsnamn för att fortsätta.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="displayName">
              Visningsnamn
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              minLength={2}
              required
              disabled={isPending}
              className="shadow appearance-none border border-gray-600 bg-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-500"
            >
              {isPending ? 'Sparar...' : 'Spara och fortsätt'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-400 text-xs italic mt-4">Fel: {error.message}</p>}
      </div>
    </div>
  );
}
