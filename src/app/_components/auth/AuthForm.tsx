
'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';
import { LoginButtons } from './LoginButtons';

/**
 * AuthForm hanterar inloggningslogiken.
 * Den använder nu signInWithPopup för en smidigare användarupplevelse utan sidomladdningar.
 */
export function AuthForm() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Använder signInWithPopup för att öppna inloggningen i en popupruta.
      // Detta undviker sidomladdning och förenklar det asynkrona flödet.
      await signInWithPopup(auth, provider);
      // Efter att popupen stängs och inloggningen är lyckad, kommer onAuthStateChanged
      // i AuthContext att triggas automatiskt. Vi behöver inte göra något mer här.

      // Vi sätter inte ens isSigningIn till false här, eftersom AuthContext tar över
      // och kommer att navigera användaren vidare, vilket gör denna komponent irrelevant.

    } catch (err) {
      console.error("Inloggningsfel:", err);

      // Hantera specifika, vanliga fel från popups.
      if (err instanceof Error && 'code' in err) {
        if (err.code === 'auth/popup-closed-by-user') {
          setError("Inloggningen avbröts.");
        } else if (err.code === 'auth/cancelled-popup-request') {
          // Ignorera detta fel, det händer om användaren klickar snabbt.
        } else {
          setError(err.message || "Ett okänt fel inträffade.");
        }
      } else {
        setError("Ett okänt fel inträffade.");
      }
      setIsSigningIn(false);
    }
  };

  return (
    <LoginButtons
      onGoogleSignIn={handleGoogleSignIn}
      isLoading={isSigningIn}
      error={error}
    />
  );
}
