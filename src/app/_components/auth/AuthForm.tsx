'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';
import { LoginButtons } from './LoginButtons';

/**
 * En klientkomponent som hanterar inloggningsformuläret och dess logik.
 * Den använder LoginButtons-komponenten och hanterar state för laddning och fel.
 */
export function AuthForm() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Omdirigerar hela sidan till Googles inloggningssida.
      // Efter lyckad inloggning omdirigerar Google tillbaka till appen.
      await signInWithRedirect(auth, provider);
      // Kodexekveringen pausas här eftersom en omdirigering sker.
    } catch (err) {
      console.error("Inloggningsfel:", err);
      setError(err instanceof Error ? err.message : "Ett okänt fel inträffade.");
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
