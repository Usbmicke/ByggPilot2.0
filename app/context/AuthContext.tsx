
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/app/firebaseConfig';

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const provider = new GoogleAuthProvider();

// -- Definiera den utökade kontext-typen --
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// -- Skapa kontexten med ett default-värde --
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { console.error("Login function called outside of AuthProvider.") },
  logout: async () => { console.error("Logout function called outside of AuthProvider.") },
});

// -- Skapa Provider-komponenten --
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Funktion för att logga in
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Omdirigering eller uppdatering av state hanteras av onAuthStateChanged
    } catch (error) {
      console.error("Error during sign-in:", error);
      // Kasta om felet så att anropande komponent kan hantera det
      throw error;
    }
  };

  // Funktion för att logga ut
  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // -- Exponera det kompletta värdet --
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// -- Skapa och exportera useAuth-hooken --
export const useAuth = () => useContext(AuthContext);
