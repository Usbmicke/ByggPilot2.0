
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client'; // Korrekt import
import { useRouter, usePathname } from 'next/navigation';

export const auth = getAuth(firebaseApp);

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

interface AuthProviderProps {
  children: ReactNode;
}

// FIXAD: Omdirigeringar pekar nu på startsidan '/' istället för den borttagna '/login'
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);

      const isAuthPage = pathname === '/' || pathname === '/onboarding';

      // Om användaren INTE är inloggad och INTE är på en auth-sida, skicka till inloggning
      if (!user && !isAuthPage) {
        router.push('/');
      }

      // Om användaren ÄR inloggad men är på huvudsidan, skicka till onboarding
      if (user && pathname === '/') {
          router.push('/onboarding');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
