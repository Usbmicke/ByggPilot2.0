
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
// Importera den direkta singleton-instansen
import { auth } from '@/lib/config/firebase-client';
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

  useEffect(() => {
    // Inget behov av att anropa en funktion, använd instansen direkt.
    let unsubscribe: () => void;

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("[AuthProvider] getRedirectResult LYCKADES. Användare:", result.user.uid);
        } else {
          console.log("[AuthProvider] Inget omdirigeringsresultat.");
        }
      })
      .catch((error) => {
        console.error("[AuthProvider] Fel vid getRedirectResult:", error);
      })
      .finally(() => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log("[AuthProvider] onAuthStateChanged anropad.", user ? `Användare: ${user.uid}`: "Ingen användare");
          setUser(user);
          setLoading(false);
        });
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);


  useEffect(() => {
    if (loading) return;

    console.log(`[AuthProvider Nav] Utvärderar. User: ${!!user}, Path: ${pathname}`);

    const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');
    const isOnboardingPage = pathname === '/onboarding';
    const isRootPage = pathname === '/';

    if (user) {
        callGenkitFlow<{ onboardingComplete: boolean, userId: string }>('getOrCreateUserAndCheckStatusFlow', {})
        .then(status => {
          console.log(`[AuthProvider Nav] Genkit status: onboardingComplete=${status.onboardingComplete}`);
          if (!status.onboardingComplete && !isOnboardingPage) {
            console.log('[AuthProvider Nav] Omdirigerar till /onboarding');
            router.push('/onboarding');
          } else if (status.onboardingComplete && (isOnboardingPage || isRootPage)) {
            console.log('[AuthProvider Nav] Omdirigerar till /dashboard');
            router.push('/dashboard');
          }
        })
        .catch(error => {
          console.error("[AuthProvider] Allvarligt fel vid anrop av Genkit-flöde:", error);
        });
    } else {
      if (isProtectedPage) {
          console.log('[AuthProvider Nav] Ingen användare, skyddad sida. Omdirigerar till /');
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
