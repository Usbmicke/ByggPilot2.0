'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGenkitMutation } from '@/lib/hooks/useGenkitMutation'; // Rätt hook för mutationer

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  
  // Anropa mutation-hooken med flödets NAMN (en sträng), inte en direkt import
  const { trigger: completeProfile, isMutating, error } = useGenkitMutation('onboardingFlow');

  // Omdirigera om användaren inte är inloggad
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Please enter a name.');
      return;
    }

    try {
      // Anropa flödet via hooken
      await completeProfile({ displayName });
      alert("Profile completed successfully!");
      router.push('/'); // Skicka användaren till startsidan
    } catch (err) {
      // Felmeddelande visas redan av hooken, men vi kan logga här
      console.error("Onboarding submission failed", err);
    }
  };

  // Visa en laddningssida medan vi verifierar sessionen
  if (authLoading || !user) {
    return <div>Loading session...</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1>Complete Your Profile</h1>
      <p>Welcome! Please enter your name to finish setting up your account.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your Name"
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" disabled={isMutating} style={{ width: '100%', padding: '10px' }}>
          {isMutating ? 'Saving...' : 'Complete Profile'}
        </button>
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </form>
    </div>
  );
}
