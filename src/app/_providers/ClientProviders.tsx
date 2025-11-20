'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';

// 1. Definiera kontext-typen
interface AuthContextType {
  user: User | null;
  isLoading: boolean; // True under den allra första session-valideringen
}

// 2. Skapa kontexten
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Hjälpfunktion för att skapa server-session
async function createSession(idToken: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (response.ok) {
      console.log('[DIAGNOS] Server-session skapad/verifierad.');
      return true;
    }
    console.error('[DIAGNOS] FEL: Servern misslyckades med att skapa sessionen.', await response.text());
    return false;
  } catch (error) {
    console.error('[DIAGNOS] ETT ALLVARLIGT FEL uppstod vid fetch till /api/auth/session:', error);
    return false;
  }
}

// 4. Huvudkomponenten: AuthProvider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged är den definitiva källan för auth-status.
    // Den hanterar automatiskt resultatet från signInWithRedirect.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(`[DIAGNOS] onAuthStateChanged anropad. Användare: ${firebaseUser?.uid || 'null'}`);
      
      if (firebaseUser) {
        // Användare är inloggad. Skapa/verifiera server-sessionen.
        const idToken = await firebaseUser.getIdToken();
        await createSession(idToken);
        setUser(firebaseUser);
      } else {
        // Användare är inte inloggad.
        setUser(null);
      }
      
      // När processen är klar är den initiala laddningen över.
      setIsLoading(false);
    });

    // Städa upp lyssnaren när komponenten tas bort
    return () => unsubscribe();
  }, []); // Denna tomma array säkerställer att effekten bara körs en gång

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111113', color: 'white' }}>
          Autentiserar...
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

// 5. Hook för att komma åt kontexten
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};

// 6. Exportera huvud-providern
export function ClientProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
