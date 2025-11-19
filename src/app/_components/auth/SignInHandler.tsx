
'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { LoginButtons } from './LoginButtons';
import { auth } from '@/app/_lib/config/firebase-client';

export const SignInHandler: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    const provider = new GoogleAuthProvider();
    // Lägger till standard-scopes för profilinformation
    provider.addScope('email');
    provider.addScope('profile');
    
    // **NYTT: Lägger till det avgörande scopet för Google Drive**
    // Detta säkerställer att vi kan skapa mappar och filer för användarens räkning.
    provider.addScope('https://www.googleapis.com/auth/drive');

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Inloggning lyckades via popup med Drive-scope:", result.user.displayName);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Google Sign-In Popup Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Inloggningen avbröts.');
      } else {
        setError('Kunde inte logga in. Kontrollera att din URL är tillagd som en "Authorized JavaScript origin" i Google Cloud Console.');
      }
      setIsLoading(false);
    }
  };

  return (
    <LoginButtons 
      onGoogleSignIn={handleGoogleSignIn}
      isLoading={isLoading}
      error={error}
    />
  );
};
