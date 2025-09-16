"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithRedirect, 
    onAuthStateChanged, 
    getRedirectResult,
    signOut,
    User 
} from 'firebase/auth';
import { firebaseConfig } from '@/app/firebaseConfig';

// --- KORREKT FIREBASE INITIALISERING ---
// Säkerställer att appen bara initialiseras en gång.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- CONTEXT DEFINITION ---
interface AuthContextType {
  user: User | null; // Den inloggade Firebase-användaren
  loading: boolean;  // Laddningsstatus för att undvika flimmer
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AUTH PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Funktion för att starta inloggningsprocessen
  const signInWithGoogle = async () => {
    setLoading(true);
    await signInWithRedirect(auth, provider);
  };

  // Funktion för utloggning
  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    // Hanterar resultatet när användaren kommer tillbaka från Google
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Användaren har loggat in
          setUser(result.user);
        }
      } catch (error) {
        console.error("Error during sign-in redirect:", error);
      }
    };

    handleRedirectResult();

    // Lyssnar på ändringar i autentiseringsstatus (t.ex. vid sidomladdning)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Städar upp prenumerationen när komponenten tas bort
    return () => unsubscribe();
  }, []);

  const value = {
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

// --- CUSTOM HOOK FÖR ENKEL ANVÄNDNING ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
