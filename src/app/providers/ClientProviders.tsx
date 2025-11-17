'use client';

import { 
  useEffect, 
  createContext, 
  useContext, 
  useState,
  ReactNode 
} from 'react';
import { onAuthStateChanged, User, signOut } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    if (!auth) return;
    toast.loading('Loggar ut...');
    try {
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.dismiss();
      toast.success('Du är nu utloggad!');
      window.location.href = '/';
    } catch (error) {
      console.error('Fel vid utloggning:', error);
      toast.dismiss();
      toast.error('Kunde inte logga ut.');
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        console.log('[AuthProvider]: Användare hittad, skapar serversession...');
        const idToken = await user.getIdToken();

        // *** KORRIGERINGEN: Skicka token i BODY som JSON ***
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          console.log('[AuthProvider]: Serversession skapad. Omdirigerar...');
          // Tvinga en refresh så middleware kan agera på den nya cookien
          router.refresh();
        } else {
          console.error('[AuthProvider]: Fel vid skapande av serversession.');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const value = { user, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      <Toaster position="top-right" />
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};
