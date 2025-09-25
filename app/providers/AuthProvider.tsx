
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { auth as firebaseAuth } from '@/app/lib/firebase/client';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation'; // Importera useRouter och usePathname

const FirebaseSyncManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Hämta den aktuella URL-sökvägen

  // Effekt för att synkronisera NextAuth -> Firebase Auth
  useEffect(() => {
    if (status === 'loading') return;

    const syncAuth = async () => {
      if (status === 'authenticated' && session) {
        if (!isFirebaseAuthenticated) {
          try {
            const response = await fetch('/api/auth/firebase', { method: 'POST' });
            const data = await response.json();

            if (response.ok && data.firebaseToken) {
              await signInWithCustomToken(firebaseAuth, data.firebaseToken);
              setIsFirebaseAuthenticated(true);
              console.log('[AuthProvider] Synkronisering lyckades: NextAuth -> Firebase');

              // **KORRIGERAD LOGIK: Omdirigering för nya användare**
              // @ts-ignore - Vi vet att isNewUser finns baserat på vår backend-logik
              if (session.user?.isNewUser && pathname !== '/onboarding') {
                console.log('[AuthProvider] Ny användare upptäckt. Omdirigerar till /onboarding.');
                router.push('/onboarding');
              }

            } else {
              throw new Error(data.error || 'Okänt fel vid hämtning av Firebase-token');
            }
          } catch (error) {
            console.error('[AuthProvider] Fel vid Firebase-inloggning:', error);
            await signOut(firebaseAuth);
            setIsFirebaseAuthenticated(false);
          }
        }
      } else if (status === 'unauthenticated') {
        if (isFirebaseAuthenticated) {
          await signOut(firebaseAuth);
          setIsFirebaseAuthenticated(false);
          console.log('[AuthProvider] Synkronisering: Utloggad från Firebase.');
        }
      }
    };

    syncAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, pathname]); // Lade till pathname som dependency

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <FirebaseSyncManager>
        {children}
      </FirebaseSyncManager>
    </SessionProvider>
  );
};
