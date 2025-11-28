
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useGenkitMutation } from '@/lib/hooks/useGenkitMutation';
// Importen behövs inte längre när vi använder flowId som en sträng
// import { onboardingFlow } from '@/genkit/flows/onboarding';

export default function OnboardingPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

  // Korrekt användning: Skicka flowId som en sträng.
  const { mutate, isPending, error } = useGenkitMutation('onboardingFlow');

  // Skydda sidan: om användaren inte är inloggad, skicka till login.
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await mutate({ displayName }, {
      onSuccess: () => {
        console.log('Onboarding successful! Redirecting to dashboard...');
        // Använd replace istället för push för att förhindra att användaren
        // kan gå tillbaka till onboarding-sidan med webbläsarens "bakåt"-knapp.
        router.replace('/');
      },
      onError: (err) => {
        console.error('Onboarding failed:', err);
        // Här kan du implementera mer användarvänlig felhantering, t.ex. en toast/notification.
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
            disabled={isPending} // Inaktivera input medan mutationen körs
          />
        </label>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}
