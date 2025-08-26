'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/firebase/init';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, getRedirectResult, OAuthCredential } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    provider.addScope('https://www.googleapis.com/auth/drive');
    provider.addScope('https://www.googleapis.com/auth/tasks');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (error) {
      console.error("Fel vid inloggning", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
    } catch (error) {
      console.error("Fel vid utloggning", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Detta är ett förenklat sätt. I en riktig app skulle du vilja
      // hämta en ny token om den gamla har gått ut.
      if (!currentUser) {
        setAccessToken(null);
      }
      setLoading(false);
    });

    // Hantera redirect-resultat för att fånga upp accessToken
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential;
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken);
          }
        }
      }).catch((error) => {
        console.error("Fel vid hantering av redirect", error);
      });


    return () => unsubscribe();
  }, []);

  const value = { user, accessToken, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
