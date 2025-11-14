'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';

// 1. Skapa en enkel, ren Context för användarstatus
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// 2. Skapa en Provider som ENDAST hanterar state-förändringar
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lyssna på ändringar i Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null); // Sätt användaren (eller null)
      setLoading(false);      // Meddela att laddningen är klar
    });

    // Städa upp prenumerationen vid unmount
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  // Visa ingenting förrän vi vet om användaren är inloggad eller inte
  // Detta förhindrar en "flash" av felaktigt innehåll.
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Skapa en hook för enkel åtkomst till contexten
export const useAuth = () => useContext(AuthContext);
