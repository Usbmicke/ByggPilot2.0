'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_providers/ClientProviders';
import Image from 'next/image';
import { LoginButtons } from '@/app/_components/auth/LoginButtons';
import { auth } from '@/app/_lib/config/firebase-client';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';

export default function LandingPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoading: isAuthLoading } = useAuth(); // Hämta auth-status
  const router = useRouter(); // Hämta routern

  // Effekt som omdirigerar användaren om de redan är inloggade.
  useEffect(() => {
    // Agera inte medan auth-status laddas.
    // Agera endast när vi vet att en användare finns.
    if (!isAuthLoading && user) {
      console.log('[DIAGNOS] Användare inloggad, omdirigerar från landningssidan -> /dashboard');
      // Omdirigera till en skyddad sida. Middlewaren kommer att fånga upp detta
      // och skicka användaren till /onboarding om det behövs.
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // Omdirigering sker, kodexekveringen pausas här.
    } catch (err) {
      console.error("Inloggningsfel:", err);
      setError(err instanceof Error ? err.message : "Ett okänt fel inträffade.");
      setIsSigningIn(false);
    }
  };

  // Visa en laddningssida medan vi initialt kollar auth-status, eller om vi redan
  // har en användare och är på väg att omdirigera. Detta förhindrar att inloggnings-
  // knapparna "flashar" för en inloggad användare.
  if (isAuthLoading || user) {
    return (
      <div className="min-h-screen bg-[#111113] flex items-center justify-center text-white">
        <p>Autentiserar...</p>
      </div>
    );
  }

  // Om vi inte laddar och ingen användare finns, visa inloggningssidan.
  return (
    <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-8 p-4 w-full max-w-sm">
        <Image
          src="/images/byggpilotlogga1.png"
          alt="ByggPilot Logotyp"
          width={120}
          height={120}
          className="rounded-2xl shadow-lg"
          priority
        />
        <div className="text-center">
          <h1 className="text-4xl font-bold">ByggPilot</h1>
          <p className="text-neutral-400 mt-2">Logga in för att fortsätta</p>
        </div>
        <LoginButtons
          onGoogleSignIn={handleGoogleSignIn}
          isLoading={isSigningIn}
          error={error}
        />
      </div>
    </div>
  );
}
