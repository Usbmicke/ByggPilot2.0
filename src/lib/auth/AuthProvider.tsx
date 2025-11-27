
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client'; // Importera klient-konfigurationen

// Typdefinition för vår Auth Context
export type AuthContextType = {
  user: User | null; // Firebase User-objektet
  idToken: string | null; // Firebase ID-token
  isLoading: boolean;
};

// Skapa Context med ett default-värde
const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
  isLoading: true,
});

// Huvudkomponenten som wrappar applikationen
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    // Detta är den kritiska lyssnaren. Den körs när användaren loggar in,
    // loggar ut, eller när token uppdateras i bakgrunden.
    const unsubscribe = onIdTokenChanged(auth, async (newUser) => {
      setUser(newUser);
      if (newUser) {
        const token = await newUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
      setIsLoading(false);
    });

    // Städa upp prenumerationen när komponenten unmountas
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, idToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Exportera en custom hook för att enkelt komma åt kontexten
export const useAuth = () => {
  return useContext(AuthContext);
};
