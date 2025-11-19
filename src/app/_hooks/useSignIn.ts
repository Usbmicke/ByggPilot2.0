
'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/app/_lib/config/firebase-client';

// =======================================================================
//  USE SIGN IN HOOK (MODERN STUK)
//  Centraliserar all inloggningslogik till en återanvändbar hook för
//  maximal koddelning och underhållsvänlighet.
// =======================================================================

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    const provider = new GoogleAuthProvider();
    // Säkerställ att vi får all nödvändig data
    provider.addScope('email');
    provider.addScope('profile');
    provider.addScope('https://www.googleapis.com/auth/drive'); // För Google Drive integration

    try {
      // Omdirigera till dashboard efter lyckad inloggning sker automatiskt
      // via AuthProvider/middleware, så vi behöver inte hantera det här.
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Inloggningen avbröts av användaren.');
      } else {
        setError('Ett fel uppstod vid inloggning. Försök igen.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isLoading, error };
};
