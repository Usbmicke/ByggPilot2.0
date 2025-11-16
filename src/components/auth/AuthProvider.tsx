'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';

// Definierar formen på vår AuthContext
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

// Skapar contexten med ett default-värde
const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

// Exporterar en custom hook för att enkelt kunna använda contexten
export const useAuth = () => useContext(AuthContext);

// Definierar props för vår provider-komponent
interface AuthProviderProps {
  children: ReactNode;
}

// Detta är komponenten som omsluter vår applikation och tillhandahåller auth-status
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onIdTokenChanged är mer robust här än onAuthStateChanged.
    // Den körs när användaren loggar in/ut OCH när deras token uppdateras.
    const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);

      if (currentUser) {
        // ANVÄNDAREN ÄR INLOGGAD PÅ KLIENTEN
        // Vi måste nu etablera en server-session.
        try {
          const idToken = await currentUser.getIdToken();
          // Skicka token till vår backend för att skapa en session cookie.
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });
          console.log("Server session established.");
        } catch (error) {
          console.error("Failed to establish server session:", error);
          // Här kan man lägga till logik för att hantera felet, t.ex. logga ut användaren.
        }
      } else {
        // ANVÄNDAREN ÄR UTLOGGAD
        // Vi måste nu förstöra server-sessionen.
        try {
          // Skicka en request för att rensa session cookien.
          await fetch('/api/auth/session', { method: 'DELETE' });
          console.log("Server session destroyed.");
        } catch (error) {
          console.error("Failed to destroy server session:", error);
        }
      }
      
      setIsLoading(false);
    });

    // Cleanup-funktion som körs när komponenten unmountas
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
