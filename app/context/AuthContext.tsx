'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User } from 'firebase/auth';
// KORRIGERING: Importera `auth` från vår nya, centraliserade `firebase.ts` fil.
import { auth } from '@/app/firebase'; 
import { useRouter } from 'next/navigation';

// Definiera en tydlig typ för kontextens värde
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Skapa kontexten med en initialt undefined värde för att hantera laddningsstatus
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Huvudkomponenten som tillhandahåller autentiseringskontexten
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // LYSSNARE FÖR AUTENTISERINGSSTATUS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Oavsett var användaren är, om de är inloggade, skicka dem till dashboarden.
      if (currentUser) {
        console.log("Användare inloggad, omdirigerar till /dashboard");
        router.push('/dashboard');
      }
    });

    // Städa upp lyssnaren när komponenten avmonteras
    return () => unsubscribe();
  }, [router]); // `router` är ett stabilt beroende

  // Funktion för att logga in med Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Fel vid inloggning med Google", error);
    }
  };

  // Funktion för att logga ut
  const logout = async () => {
    try {
      await signOut(auth);
      // Omdirigera explicit till startsidan för en snabbare användarupplevelse.
      console.log("Användare utloggad, omdirigerar till /");
      router.push('/');
    } catch (error) {
      console.error("Fel vid utloggning", error);
    }
  };

  // Samla värdena som ska tillhandahållas av kontexten
  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exportera en anpassad hook för att enkelt kunna använda kontexten
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
