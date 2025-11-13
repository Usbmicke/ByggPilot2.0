
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
// Importera den direkta singleton-instansen
import { auth } from '@/lib/config/firebase-client';
import GoogleIcon from '@/components/icons/GoogleIcon';

const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    toast.loading('Omdirigerar till Google...');
    const provider = new GoogleAuthProvider();
    
    // Använd den importerade instansen direkt.
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Fel vid initiering av Google-inloggning:", error);
      toast.dismiss();
      toast.error('Kunde inte starta inloggningen. Försök igen.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-800 bg-neutral-100 border border-transparent rounded-full shadow-sm hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {isLoading ? (
        <span>Omdirigerar...</span>
      ) : (
        <>
          <GoogleIcon className="-ml-1 mr-2 h-4 w-4" />
          Logga in med Google
        </>
      )}
    </button>
  );
};

export default LoginButtons;
