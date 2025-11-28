
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGenkit } from '@/lib/hooks/useGenkit';
import { getUserProfileFlow } from '@/genkit/flows/getUserProfile';
import { getProjectsFlow } from '@/genkit/flows/getProjectsFlow';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Flöde 1: Hämta användarprofilen
  const { data: userProfile, isLoading: isProfileLoading } = useGenkit(
    user ? getUserProfileFlow : null,
    { uid: user?.uid! }
  );

  // Flöde 2: Hämta användarens projekt (mappar)
  // Detta anrop körs automatiskt när userProfile har laddats och onboarding är klar.
  const { 
    data: projects, 
    isLoading: areProjectsLoading 
  } = useGenkit(
    userProfile?.onboardingCompleted ? getProjectsFlow : null, 
    undefined // Inget input behövs för detta flöde
  );

  useEffect(() => {
    const isLoading = isAuthLoading || isProfileLoading;
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
    } else if (userProfile && !userProfile.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [user, userProfile, isAuthLoading, isProfileLoading, router]);
  
  const isLoading = isAuthLoading || isProfileLoading || areProjectsLoading;
  if (isLoading || !userProfile) {
    return <div>Loading application...</div>;
  }

  return (
    <main>
      <h1>Welcome, {userProfile.displayName}!</h1>
      <p>This is your dashboard. Your projects are listed below.</p>
      
      <section>
        <h2>Your Projects</h2>
        {projects && projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        ) : (
          <p>You don't have any projects yet.</p>
        )}
      </section>
    </main>
  );
}
