
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useGenkit } from '@/lib/hooks/useGenkit';
import { getUserProfileFlow } from '@/genkit/flows/getUserProfile'; // KORREKT IMPORT

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const { data: userProfile, isLoading: isProfileLoading } = useGenkit(
    getUserProfileFlow, // Använd det nya, korrekta flödet
    { userId: user?.uid! },
    { skip: !user?.uid }
  );

  useEffect(() => {
    const isLoading = isAuthLoading || isProfileLoading;
    if (isLoading) return;

    if (!user) {
      router.push('/login');
    } else if (user && userProfile && !userProfile.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, userProfile, isAuthLoading, isProfileLoading, router]);
  
  if (isAuthLoading || isProfileLoading || !userProfile) {
    return <div>Loading application...</div>;
  }

  return (
    <main>
      <h1>Welcome, {userProfile.displayName}!</h1>
      <p>This is your dashboard.</p>
    </main>
  );
}
