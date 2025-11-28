
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useGenkitMutation } from '@/lib/hooks/useGenkitMutation';
import { onboardingFlow } from '@/genkit/flows/onboarding';

export default function OnboardingPage() {
  const { user, isLoading: isAuthLoading, idToken } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

  // Använd vår custom hook för mutationer
  const { mutate, isPending, error } = useGenkitMutation(onboardingFlow);

  // Skydda sidan: om användaren inte är inloggad, skicka till login.
  // Om användaren redan har slutfört onboarding, skicka till startsidan.
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
    // Antag att user-objektet från din DAL/flow innehåller onboardingCompleted
    // Detta behöver hämtas via ett separat `getUserProfile` flow.
    // För nu omdirigerar vi bara om de är inloggade.
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    await mutate({ displayName }, {
      onSuccess: () => {
        console.log('Onboarding successful!');
        router.push('/'); // Skicka användaren till startsidan efter lyckad onboarding
        router.refresh(); // Tvinga en uppdatering av server-komponenter om det behövs
      },
      onError: (err) => {
        console.error('Onboarding failed:', err);
        // Visa felmeddelande för användaren
      }
    });
  };

  if (isAuthLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome!</h1>
      <p>Let's get your profile set up.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Display Name:
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={2}
            required
          />
        </label>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
