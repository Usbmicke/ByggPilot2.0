
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/app/_lib/schemas/user'; // Antag att denna typ-definition existerar

// Typ-definition för vad vår kontext kommer att innehålla
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  // Funktion för att manuellt ladda om användardata om det behövs
  refetchUser: () => void;
}

// Skapa kontexten med ett default-värde
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider-komponenten som kommer att omsluta vår app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Börja som true för att visa laddningsstatus vid start
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/me');
      if (!response.ok) {
        // Om vi får 401 eller liknande, betyder det att användaren inte är inloggad.
        // Detta är ett förväntat scenario, inte nödvändigtvis ett fel.
        setUser(null);
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const userData: UserProfile = await response.json();
      setUser(userData);
    } catch (e: any) {
        // Vi loggar felet men sätter inte ett felmeddelande i state,
        // eftersom ett misslyckat anrop oftast bara betyder "inte inloggad".
        console.log('AuthContext fetchUser (kan ignoreras om ej inloggad):', e.message);
        setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook för att enkelt kunna använda kontexten i andra komponenter
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
