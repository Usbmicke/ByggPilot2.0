'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/firebase/init';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, getRedirectResult, OAuthCredential } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isDemo: boolean;
  login: (isDemoMode?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const login = async (isDemoMode = false) => {
    setLoading(true);
    setIsDemo(isDemoMode);

    if (isDemoMode) {
      // Skapa en mock-användare för demoläget
      const mockUser = {
        displayName: 'Demo Användare',
        email: 'demo@byggpilot.se',
        photoURL: '/images/mickebild.png', // Använd en placeholder-bild
        uid: 'demouser',
      } as User;
      setUser(mockUser);
      setAccessToken('demotoken'); // Använd en mock-token
      setLoading(false);
      return;
    }

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
      setUser(result.user);
    } catch (error) {
      console.error("Fel vid inloggning", error);
      setIsDemo(false); // Återställ om inloggningen misslyckas
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAccessToken(null);
      setIsDemo(false); // Återställ demoläge vid utloggning
    } catch (error) {
      console.error("Fel vid utloggning", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isDemo) return; // Ignorera onAuthStateChanged om vi är i demoläge
      setUser(currentUser);
      if (!currentUser) {
        setAccessToken(null);
      }
      setLoading(false);
    });

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
  }, [isDemo]); // Kör om effekten om isDemo ändras

  const value = { user, accessToken, loading, isDemo, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
