
'use client';
// GULDSTANDARD v2025.14: Genkit-Native AuthForm (Header-Based)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
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
      const result = await signInWithPopup(auth, provider);
      const firebaseUser: User = result.user;
      const idToken = await firebaseUser.getIdToken();

      // STEG 3 (KORRIGERAD): Anropa Genkit med Authorization-header.
      const response = await fetch('/api/genkit/flows/userSessionLogin', {
        method: 'POST',
        headers: {
          // Inga 'Content-Type' behövs eftersom vi inte skickar någon body.
          'Authorization': `Bearer ${idToken}`,
        },
        // INGEN body behövs. `firebaseAuth()`-policyn läser från headern.
      });

      if (!response.ok) {
        // Om servern svarar med fel, försök läsa felmeddelandet.
        const errorData = await response.json().catch(() => null); // Försök parsa JSON, annars null.
        console.error('[AuthForm] Genkit flow error:', errorData || response.statusText);
        throw new Error(errorData?.message || 'Servern svarade med ett fel.');
      }

      const flowResult = await response.json();

      if (flowResult.status === 'error') {
        // Hantera det strukturerade felet från vårt `try...catch`-block i Genkit.
        console.error('[AuthForm] Explicit error from Genkit flow:', flowResult.details);
        throw new Error(flowResult.message);
      }

      console.log('[AuthForm] Genkit flow succeeded. Redirecting...');
      router.push('/dashboard');

    } catch (err) {
      console.error("[AuthForm] Login process failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      // Logga ut användaren från Firebase om backend-valideringen misslyckas.
      await auth.signOut(); 
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
