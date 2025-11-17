'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';

interface AuthContextType {
  user: User | null; // Detta är Firebase-användarobjektet på klienten.
  loading: boolean;
  signOut: () => Promise<void>;
}

// Steg 1: Skapa en kontext för att dela auth-status i hela appen.
const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => {} });

// Steg 2: Skapa provider-komponenten som hanterar all auth-logik.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Vi behöver en flagga för att förhindra att utloggnings-API:et anropas vid första sidladdningen.
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Denna effekt hanterar synkroniseringen mellan Firebase Auth-tillstånd och vår backend-session.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // **KORRIGERING:** Sätt användaren FÖRST, och ta bort laddningsskärmen EFTERÅT.
      // Detta garanterar att resten av appen inte renderas i ett osäkert tillstånd.
      setUser(firebaseUser); 
      setLoading(false);

      if (firebaseUser) {
        // ANVÄNDAREN ÄR INLOGGAD (eller har precis registrerat sig).
        // Hämta idToken och skicka det till vår backend för att skapa en säker httpOnly-cookie.
        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch (error) {
          console.error('Authprovider: Kritiskt fel vid skapande av serversession:', error);
          // Här kan man eventuellt tvinga en utloggning om sessionen inte kan skapas.
        }
      } else if (!initialLoad) {
        // ANVÄNDAREN HAR AKTIVT LOGGAT UT.
        // Anropa vår dedikerade utloggnings-endpoint för att rensa den säkra cookien.
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Authprovider: Fel vid anrop till logout-endpoint:', error);
        }
      }

      if (initialLoad) {
        setInitialLoad(false);
      }
    });

    // Städa upp prenumerationen när komponenten unmountas.
    return () => unsubscribe();
  }, [initialLoad]); // Kör effekten igen när initialLoad ändras.

  const signOut = async () => {
    // Detta anrop triggar `onAuthStateChanged` ovan med `firebaseUser = null`,
    // vilket i sin tur kör vår logik för att rensa server-sessionen.
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children} // Denna rad är nu säker tack vare korrigeringen ovan.
    </AuthContext.Provider>
  );
}

// Steg 3: Skapa en anpassad hook för att enkelt komma åt auth-status.
export const useAuth = () => useContext(AuthContext);
