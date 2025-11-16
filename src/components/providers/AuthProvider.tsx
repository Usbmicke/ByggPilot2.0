import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Steg 1: Lyssna på Firebase och uppdatera endast React-tillståndet.
  // Denna effekt körs bara en gång och håller React i synk med Firebase.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Steg 2: Synkronisera med servern NÄR React-tillståndet (user) FAKTISKT ändras.
  // Detta förhindrar race conditions genom att agera på ett stabilt tillstånd.
  useEffect(() => {
    const syncSession = async () => {
      if (user) {
        // Användaren har loggat in, hämta token och skapa server-session.
        try {
          const token = await user.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch (error) {
          console.error('Fel vid skapande av session:', error);
        }
      } else {
        // Användaren har loggat ut, radera server-sessionen.
        try {
          await fetch('/api/auth/session', { method: 'DELETE' });
        } catch (error) {
          console.error('Fel vid radering av session:', error);
        }
      }
    };

    // Kör inte synkroniseringen under den initiala laddningen, utan först när
    // det första auth-tillståndet har fastställts.
    if (!loading) {
      syncSession();
    }
  }, [user, loading]); // Denna effekt är beroende av `user` och `loading`.

  const signOut = async () => {
    await firebaseSignOut(auth);
    // Detta triggar onAuthStateChanged -> setUser(null) -> vilket triggar synk-effekten.
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
