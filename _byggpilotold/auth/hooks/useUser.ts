
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { UserProfile } from '@/lib/dal';
import useSWR from 'swr';

// Denna fetcher används av SWR för att hämta profil-data från vårt Genkit-flöde.
const profileFetcher = async (url: string, idToken: string) => {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    // Om status är 404, betyder det att profilen inte finns än, vilket är OK.
    if (res.status === 404) {
      return null;
    }
    const error = new Error('Ett fel uppstod när profilen skulle hämtas.');
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export function useUser() {
  // State för Firebase-användarobjektet (innehåller uid, email, etc.)
  const [user, setUser] = useState<User | null>(null);
  // State för den initiala laddningen av auth-status.
  const [isLoading, setIsLoading] = useState(true);
  // State för ID-token som behövs för att anropa säkrade API:er.
  const [idToken, setIdToken] = useState<string | null>(null);

  // Lyssna på ändringar i Firebase Auth-status.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Användare är inloggad.
        setUser(firebaseUser);
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } else {
        // Användare är utloggad.
        setUser(null);
        setIdToken(null);
      }
      // Auth-status är fastställd, sluta ladda.
      setIsLoading(false);
    });

    // Rensa upp prenumerationen när komponenten tas bort.
    return () => unsubscribe();
  }, []);

  // Använd SWR för att hämta den utökade profilen från Firestore via vårt Genkit-flöde.
  // Anropet görs bara om vi har ett ID-token (dvs. användaren är inloggad).
  const { data: profile, error: profileError, isLoading: isProfileLoading, mutate } = useSWR(
    idToken ? '/api/genkit/flows/getUserProfile' : null,
    (url) => profileFetcher(url, idToken!),
    { 
      revalidateOnFocus: false, 
      shouldRetryOnError: false 
    }
  );

  return {
    // Det fullständiga Firebase-användarobjektet.
    user,
    // Den utökade profilen från Firestore.
    profile: profile as UserProfile | null,
    // True medan auth-status och profil hämtas.
    isLoading: isLoading || isProfileLoading,
    // Ett eventuellt fel från profilhämtningen.
    isError: !!profileError,
    // SWR:s mutate-funktion för att manuellt uppdatera profildata.
    mutateProfile: mutate,
  };
}
