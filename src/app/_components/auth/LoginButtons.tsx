'use client';

import { useState } from 'react';
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/config/firebase-client'; // Korrekt, direkt import av auth-instansen
import { FaGoogle } from 'react-icons/fa';

export const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    // Guard-satsen behövs inte längre eftersom `auth` importeras direkt 
    // och alltid kommer att finnas tillgänglig.

    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    provider.addScope('email');
    provider.addScope('profile');

    try {
      // Vi använder den direktimporterade `auth`-instansen här.
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Redirect Error:", error);
      setError('Kunde inte starta inloggningen. Vänligen försök igen.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading} // Förenklad villkorskontroll
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <FaGoogle />
        <span>
          {isLoading ? 'Omdirigerar till Google...' : 'Logga in med Google'}
        </span>
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
