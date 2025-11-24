
'use client';
// GULDSTANDARD v15.0: Moderniserad AuthForm
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';
import { LoginButtons } from './LoginButtons';

export function AuthForm() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      // Steg 1: Användaren loggar in med Firebase Popup
      const result = await signInWithPopup(auth, provider);
      const firebaseUser: User = result.user;

      // Steg 2: Hämta ID-token från den inloggade användaren
      const idToken = await firebaseUser.getIdToken();

      // Steg 3: Skicka token till vår nya, säkra backend-endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        // Om servern misslyckas med att skapa en session, logga ut användaren från Firebase
        await auth.signOut();
        throw new Error('Failed to create server session.');
      }

      const data = await response.json();

      // Steg 4: Navigera programmatiskt baserat på serverns svar
      console.log('[AuthForm] Session skapad. Omdirigerar...');
      if (data.user && !data.user.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      console.error("[AuthForm] Inloggningsprocess misslyckades:", err);
      let errorMessage = "Ett okänt fel inträffade.";
      if (err instanceof Error) {
        if ('code' in err) {
            const code = (err as {code: string}).code;
            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
                errorMessage = "Inloggningen avbröts.";
            } else {
                errorMessage = err.message;
            }
        } else {
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
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
