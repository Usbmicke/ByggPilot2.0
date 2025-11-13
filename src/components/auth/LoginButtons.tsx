'use client';

import { useState } from 'react';
import { setPersistence, browserLocalPersistence, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/config/firebase-client';
import { FaGoogle } from 'react-icons/fa';

// FIX: Omskriven med 'export const' syntax för att lösa Next.js byggfel.
// Detta är ett mer robust sätt att definiera React-komponenter.
export const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Fel vid Google inloggning:", error);
      setIsLoading(false); 
    }
  };

  return (
    <button
      onClick={!isLoading ? handleGoogleSignIn : undefined}
      disabled={isLoading}
      className="flex items-center justify-center gap-2.5 bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap text-sm"
    >
      <FaGoogle />
      <span>
        {isLoading ? 'Omdirigerar...' : 'Logga in med Google'}
      </span>
    </button>
  );
};
