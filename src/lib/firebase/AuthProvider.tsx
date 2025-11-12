
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
// Uppdaterad import: Hämta funktionen, inte objektet direkt.
import { getClientAuth } from '@/lib/config/firebase-client';
import { useRouter, usePathname } from 'next/navigation';
import { callGenkitFlow } from '@/lib/genkit';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Denna useEffect körs BARA på klienten, vilket är vad vi vill.
  useEffect(() => {
    // Hämta auth-instansen här, garanterat på klienten.
    const auth = getClientAuth();

    getRedirectResult(auth).catch((error) => {
      console.error("[AuthProvider] Fel vid getRedirectResult:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[AuthProvider] onAuthStateChanged (klient) anropad.", user ? `Användare: ${user.uid}`: "Ingen användare");
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');
    const isOnboardingPage = pathname === '/onboarding';
    const isRootPage = pathname === '/';

    if (user) {
      callGenkitFlow<{ onboardingComplete: boolean }>('getOrCreateUserAndCheckStatusFlow', {})
        .then(status => {
          if (!status.onboardingComplete && !isOnboardingPage) {
            router.push('/onboarding');
          } else if (status.onboardingComplete && (isOnboardingPage || isRootPage)) {
            router.push('/dashboard');
          }
        })
        .catch(error => {
          console.error("[AuthProvider] Fel vid anrop av Genkit-flöde:", error);
        });
    } else {
      if (isProtectedPage) {
          router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};
