
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/client/auth';
import { useRouter, usePathname } from 'next/navigation';
import { getUserById } from '@/lib/dal/repositories/user.repo'; // We need a way to call this client-side

// This is a client-side component to handle auth state and redirection
export default function AuthHandler({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until Firebase auth state is loaded
    }

    const isAuthPage = pathname === '/'; // Assuming '/' is the login page

    if (!user) {
      // If not logged in and not on the login page, redirect to login
      if (!isAuthPage) {
        router.push('/');
      }
      return;
    }

    // User is logged in, now check their onboarding status.
    // We need an API route to securely get user data from the client.
    fetch(`/api/user/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        const hasOnboarded = data.hasOnboarded;
        const isOnboardingPage = pathname === '/onboarding';

        if (hasOnboarded && (isOnboardingPage || isAuthPage)) {
          // If onboarded, redirect to dashboard
          router.push('/dashboard');
        } else if (!hasOnboarded && !isOnboardingPage) {
          // If not onboarded and not on the onboarding page, redirect there
          router.push('/onboarding');
        }
      });

  }, [user, loading, router, pathname]);

  return <>{children}</>;
}
