'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, getIdToken } from '@firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client'; 
import { useRouter } from 'next/navigation';

// --- 1. AUTHENTICATION CONTEXT ---

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Den "tålmodiga" AuthProvider-logiken
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<'pending' | 'loggedIn' | 'loggedOut'>('pending');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(`[AuthProvider]: onAuthStateChanged körs. Status: ${user ? user.email : 'null'}`);

      if (user) {
        // --- ANVÄNDAREN ÄR INLOGGAD (från Google) ---
        setUser(user);
        try {
          const idToken = await user.getIdToken();
          console.log('[AuthProvider]: Har ID-token. Anropar /api/auth/session...');

          const sessionResponse = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: idToken }),
          });

          if (!sessionResponse.ok) {
            throw new Error(`Servern misslyckades skapa session: ${sessionResponse.statusText}`);
          }
          
          console.log('[AuthProvider]: Session-cookie skapad. Sätter state "loggedIn".');
          setAuthState('loggedIn');
          router.refresh(); 

        } catch (error) {
          console.error('[AuthProvider]: Fel vid skapande av session:', error);
          setAuthState('loggedOut');
          // VI TAR BORT DET FELAKTIGA LOGOUT-ANROPET HÄRIFRÅN
        }
      } else {
        // --- ANVÄNDAREN ÄR UTLOGGAD ---
        setUser(null);
        setAuthState('loggedOut');
        // DET FELAKTIGA LOGOUT-ANROPET TAS ÄVEN BORT HÄRIFRÅN
      }
    });

    return () => unsubscribe();
  }, [router]); // Beroendet av authState tas bort för att förhindra race condition

  if (authState === 'pending') {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#1a1a1a', 
        color: 'white', 
        fontFamily: 'sans-serif'
      }}>
        Laddar ByggPilot...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: authState === 'pending' }}>
      {children}
    </AuthContext.Provider>
  );
}

// Exportera hooken som Header.tsx behöver
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};

// --- 2. HUVUD-PROVIDERN ---

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
