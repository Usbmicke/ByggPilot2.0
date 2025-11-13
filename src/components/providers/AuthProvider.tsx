'use client';

import { useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/config/firebase-client';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Toaster } from 'react-hot-toast';

// En enkel spinner-komponent för laddningsstatus
const Spinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
);

interface AuthProviderProps {
  children: ReactNode;
}

// Definierar det förväntade svaret från vårt backend-flöde
interface UserStatusResponse {
    isOnboarded: boolean;
    userExists: boolean;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Börjar med loading=true för att visa spinner tills första auth-kollen är klar
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Säkerställer att functions bara initieras en gång.
    const functions = getFunctions(auth.app);
    const getOrCreateUserAndCheckStatusFlow = httpsCallable<void, UserStatusResponse>(functions, 'getOrCreateUserAndCheckStatusFlow');

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      const isPublicPath = ['/', '/login'].includes(pathname); // Anta att '/' är inloggningssidan

      if (user) {
        // Användare inloggad
        try {
          console.log(`Användare ${user.uid} inloggad. Synkroniserar med backend...`);
          // Genkits onCall-trigger hanterar token-verifiering automatiskt.
          const result = await getOrCreateUserAndCheckStatusFlow();
          const data = result.data;
          console.log('Backend-svar:', data);

          if (data.isOnboarded) {
            // Användare är fullt onboardad.
            // Om de är på en publik sida (som login), skicka dem till dashboard.
            if (isPublicPath) {
              router.replace('/dashboard');
            }
          } else {
            // Användare finns men har inte slutfört onboarding.
            // Tvinga dem till onboarding-sidan.
            if (pathname !== '/onboarding') {
              router.replace('/onboarding');
            }
          }
        } catch (error) {
          console.error("Kritiskt fel: Backend-synkronisering av användare misslyckades.", error);
          // Om backend-synk misslyckas, logga ut och skicka till inloggningssidan.
          await auth.signOut();
          router.replace('/');
        } finally {
           // Sluta ladda först när all logik är klar
           setLoading(false);
        }
      } else {
        // Användare är utloggad.
        // Om de är på en skyddad sida, skicka till inloggningssidan.
        const isProtectedPath = !isPublicPath && pathname !== '/onboarding';
        if (isProtectedPath) {
          router.replace('/');
        }
        setLoading(false);
      }
    });

    // Rensa upp prenumerationen vid unmount
    return () => unsubscribe();
  }, [pathname, router]); // Körs vid rutt-ändringar

  if (loading) {
    return (
      <div className="bg-background flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Rendera children först när auth-status är löst
  return (
    <>
      <Toaster position="top-center" />
      {children}
    </>
  );
}
