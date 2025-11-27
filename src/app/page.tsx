
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGenkit } from '@/lib/hooks/useGenkit';

// Definerar output-typen för `getUserProfile`-flödet. 
// Detta är den enda "kunskapen" klienten behöver om flödet.
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  onboardingCompleted: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // GOLD STANDARD: Använd useGenkit-hooken med en STRÄNG som flowId.
  // Detta bryter beroendet till serverkoden. Anropet pausas automatiskt
  // (returnerar null) om `user` inte finns än.
  const { data: userProfile, isLoading: profileLoading } = useGenkit<any, UserProfile | null>(
    user ? 'getUserProfile' : null, // Pausa om ingen användare
    { userId: user?.uid || '' } // Skicka med userId
  );

  const isLoading = authLoading || profileLoading;

  useEffect(() => {
    // Låt all data ladda klart först.
    if (isLoading) {
      return; // Gör ingenting medan vi laddar.
    }

    // När laddningen är klar, agera baserat på datan.
    if (!user) {
      // Ingen användare, skicka till login.
      router.push('/login');
    } else if (user && userProfile && !userProfile.onboardingCompleted) {
      // Användare finns, profil finns, men onboarding är inte klar.
      router.push('/onboarding');
    }
    // Om användare finns och onboarding är klar, stanna kvar här.

  }, [user, userProfile, isLoading, router]);

  // Visa ett meningsfullt laddnings-UI
  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  // Visa ett välkomstmeddelande när allt är klart
  if (user && userProfile?.onboardingCompleted) {
    return (
      <div>
        <h1>Welcome, {userProfile.displayName || 'User'}!</h1>
        <p>Your profile is complete.</p>
      </div>
    );
  }

  // Fallback-UI, visas kortvarigt under omdirigeringar.
  return <div>Authenticating...</div>;
}
