
'use client'
import { useState } from 'react';
import toast from 'react-hot-toast';
import GoogleIcon from '@/components/icons/GoogleIcon';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; // Importera den konfigurerade auth-instansen

const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      // Starta inloggningsprocessen med ett popup-fönster
      const result = await signInWithPopup(auth, provider);
      
      // Användaren har loggats in framgångsrikt
      const user = result.user;
      console.log("Inloggad som:", user.displayName);

      // Här skulle vi normalt hämta ID-token och spara i state/context
      // const token = await user.getIdToken();
      // console.log("Firebase ID Token:", token);

      toast.success(`Välkommen, ${user.displayName}!`);

      // Omdirigera till dashboard efter lyckad inloggning
      window.location.href = '/dashboard';

    } catch (error) {
      console.error("Fel vid Google-inloggning:", error);
      toast.error('Något gick fel vid inloggningen. Försök igen.');
      setIsLoading(false);
    }
    // Not: setIsLoading(false) behövs inte vid lyckad inloggning eftersom sidan omdirigeras.
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
