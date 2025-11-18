
'use client';

import { useState } from 'react';
// ÄNDRING: Byter tillbaka till signInWithRedirect som är rätt för produktionsmiljön
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { LoginButtons } from './LoginButtons';

// IMPORTERA DEN KORREKTA, CENTRALA AUTH-INSTANSEN
import { auth } from '@/app/_lib/config/firebase-client';

export const SignInHandler: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      // Anropa signInWithRedirect. Detta är den korrekta metoden när allt är rätt konfigurerat.
      await signInWithRedirect(auth, provider);
      // Efter detta anrop kommer sidan att omdirigeras av Firebase, så kod här under körs sällan.
    } catch (error: any) {
      console.error("Google Sign-In Redirect Error:", error);
      setError('Kunde inte starta inloggningen. Vänligen försök igen.');
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
