'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';

// --- CONTEXT SETUP ---
interface AuthContextType {
  user: User | null; // Firebase User-objektet
  isLoading: boolean; // Säger om vi aktivt försöker fastställa inloggningsstatus
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AUTH PROVIDER KOMPONENT ---
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Startar som true tills vi vet status

  useEffect(() => {
    console.log('[DIAGNOS] AuthProvider useEffect körs.');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(`[DIAGNOS] onAuthStateChanged callback. Användarstatus från Firebase: ${firebaseUser ? firebaseUser.email : 'null'}`);
      
      if (firebaseUser) {
        // Steg 1: Firebase säger att en användare är inloggad.
        setUser(firebaseUser);

        try {
          console.log('[DIAGNOS] Användare finns. Hämtar ID-token...');
          const idToken = await firebaseUser.getIdToken();
          console.log('[DIAGNOS] Har token. Anropar POST /api/auth/session för att skapa server-cookie.');

          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (!response.ok) {
            // Servern misslyckades med att skapa sessionen
            const errorBody = await response.text();
            console.error(`[DIAGNOS] FEL: Servern svarade med ${response.status}. Body:`, errorBody);
            throw new Error('Server-side session creation failed.');
          }

          console.log('[DIAGNOS] Servern skapade sessionen framgångsrikt.');

        } catch (error) {
          console.error('[DIAGNOS] ETT ALLVARLIGT FEL UPPSTOD under sessionsskapandet:', error);
          // Om sessionsskapandet misslyckas, loggar vi ut användaren från klienten för att undvika osynk.
          // Detta kan hända om servern är nere eller om det finns ett fel i API-routen.
          setUser(null);
        }

      } else {
        // Steg 2: Firebase säger att ingen användare är inloggad.
        console.log('[DIAGNOS] Ingen Firebase-användare. Sätter user-state till null.');
        setUser(null);
      }

      // Steg 3: Vi är klara med den initiala laddningen.
      setIsLoading(false);
    });

    // Cleanup-funktion som körs när komponenten tas bort
    return () => {
      console.log('[DIAGNOS] AuthProvider unmounted. Avbryter prenumeration på onAuthStateChanged.');
      unsubscribe();
    };
  }, []); // Tom beroendearray säkerställer att detta bara körs en gång vid montering

  // Medan vi väntar på det första svaret från onAuthStateChanged, visa en laddningsindikator.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Laddar...
      </div>
    );
  }

  // När laddningen är klar, rendera applikationen med rätt inloggningsstatus.
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- CUSTOM HOOK ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};

// --- HUVUD-PROVIDER ---
export function ClientProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
