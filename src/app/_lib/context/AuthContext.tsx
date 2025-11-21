
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';
import { UserProfile } from '@/app/_lib/schemas/user';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        console.log('AuthContext: Användare upptäckt. Synkroniserar session...');
        const idToken = await firebaseUser.getIdToken();

        // ======================= DIAGNOSTISK SPÅRNING START =======================
        try {
          const sessionResponse = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          // Läs ALLTID svaret från servern, oavsett statuskod
          const responseData = await sessionResponse.json();

          console.log('[AuthContext] Diagnostiskt svar från /api/auth/session:', responseData);

          if (responseData.status === 'success') {
            console.log('AuthContext: Session synkad. Hämtar användarprofil...');
            const profileResponse = await fetch('/api/user/me');
            if (profileResponse.ok) {
              const userProfile: UserProfile = await profileResponse.json();
              setUser(userProfile);
              console.log('AuthContext: Användarprofil laddad.', userProfile);
            } else {
              console.error('AuthContext: Kunde inte hämta profil trots lyckad session.');
              setUser(null);
            }
          } else {
            // Om servern rapporterar ett fel, logga det detaljerade felet
            console.error('AuthContext: Servern misslyckades med att skapa session. Detaljer:', responseData.error);
            setUser(null);
          }
        } catch (error) {
          console.error('AuthContext: Ett oväntat nätverksfel eller JSON-parse-fel inträffade.', error);
          setUser(null);
        }
        // ======================== DIAGNOSTISK SPÅRNING SLUT ========================

      } else {
        console.log('AuthContext: Ingen användare upptäckt (utloggad).');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {!isLoading && children}
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
