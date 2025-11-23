
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';
import { UserProfile } from '@/app/_lib/schemas/user';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialAuth, setIsInitialAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();

        // Anropas ENDAST vid den allra första sidladdningen eller efter en ny inloggning.
        if (isInitialAuth) {
          console.log('[AuthContext] Första autentisering upptäckt. Synkroniserar session...');
          setIsInitialAuth(false); // Förhindra att detta block körs igen

          try {
            const res = await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
              throw new Error(`Server responded with ${res.status}`);
            }
            
            console.log('[AuthContext] Session synkad. Tvingar fullständig sidomladdning för att aktivera proxy.');
            // Istället för att bara uppdatera state, gör vi en hård navigering.
            // Detta säkerställer att den nya __session-cookien skickas till servern
            // och att vår Proxy kan omdirigera till rätt sida (/onboarding eller /dashboard).
            router.refresh(); // Tvingar en "refresh" av aktuell sida, vilket åter-kör server-komponenter & proxy.

          } catch (error) {
            console.error('[AuthContext] Fel vid synkronisering av session:', error);
            setUser(null);
            setIsLoading(false);
            return;
          }
        }

        // När proxyn har gjort sitt jobb (efter router.refresh()), laddar vi profildata på klientsidan.
        try {
          const profileResponse = await fetch('/api/user/me');
          if (profileResponse.ok) {
            const userProfile: UserProfile = await profileResponse.json();
            setUser(userProfile);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }

      } else {
        console.log('[AuthContext] Ingen Firebase-användare.');
        setUser(null);
        setIsInitialAuth(true); // Återställ för nästa inloggningsförsök
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isInitialAuth, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
