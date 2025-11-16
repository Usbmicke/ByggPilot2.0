'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from "@firebase/auth";
import { auth } from '@/lib/config/firebase-client';
import { FaGoogle } from 'react-icons/fa';

// Denna komponent initierar Google-inloggningen via en popup.
// Den komplexa logiken för att hantera sessionen ligger inte här,
// utan i AuthProvider och på servern.
export const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      // Starta inloggningen. `AuthProvider` kommer att upptäcka
      // ändringen i `onAuthStateChanged` och hantera sessionsskapandet.
      await signInWithPopup(auth, provider);
      // Ingen omdirigering eller token-hantering behövs här.
      // `AuthProvider` tar över.
    } catch (error: any) {
      // Hantera specifika, användarvänliga fel
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Inloggningsfönstret stängdes.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignorera detta, händer när användaren klickar snabbt
      } else {
        console.error("Google Sign-In Error:", error);
        setError('Ett fel uppstod vid inloggning.');
      }
      setIsLoading(false);
    }
    // `isLoading` kommer att sättas till false via AuthProvider när allt är klart.
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <FaGoogle />
        <span>
          {isLoading ? 'Väntar på Google...' : 'Logga in med Google'}
        </span>
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
