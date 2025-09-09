'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

// 1. Skapa en Context
interface AuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Skapa en custom hook för att enkelt använda contexten
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. Skapa en Provider-komponent som använder useSession
const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  return (
    <AuthContext.Provider value={{ session, status }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Skapa en huvud-provider som inkluderar NextAuths SessionProvider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
};
