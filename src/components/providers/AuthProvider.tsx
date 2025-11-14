import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';
import { useRouter, usePathname } from 'next/navigation';

// --- Definiera dina sidor ---
const PUBLIC_PATHS = ['/'];
const PROTECTED_PATHS = ['/dashboard', '/onboarding'];

// --- Skapa Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// --- Huvudkomponenten: AuthProvider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Börja alltid som 'laddar'
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false); // Markera som klar
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) {
      return; // Gör INGET förrän laddning är klar
    }

    const pathIsProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
    const pathIsPublic = PUBLIC_PATHS.includes(pathname);

    // FALL 1: Inte inloggad
    if (!user && pathIsProtected) {
      router.push('/');
    }

    // FALL 2: Inloggad
    if (user && pathIsPublic) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  // Visa en tom sida eller spinner medan vi väntar
  if (loading) {
    return <>Laddar...</>;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
