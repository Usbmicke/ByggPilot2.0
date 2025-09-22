
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { auth as firebaseAuth } from '@/app/lib/firebase/client';
import { signInWithCustomToken, signOut } from 'firebase/auth';

// =============================================================================
// HJÄRNAN FÖR SYNKRONISERING MELLAN NEXT-AUTH OCH FIREBASE
// =============================================================================

const FirebaseSync = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Vänta tills NextAuth-sessionen är laddad

    const syncAuth = async () => {
      if (status === 'authenticated' && session) {
        // Användare är inloggad i NextAuth
        if (!isFirebaseAuthenticated) {
          try {
            // 1. Hämta anpassad Firebase-token från vårt nya API
            const response = await fetch('/api/auth/firebase', { method: 'POST' });
            const data = await response.json();

            if (response.ok && data.firebaseToken) {
              // 2. Logga in i Firebase med den anpassade token
              await signInWithCustomToken(firebaseAuth, data.firebaseToken);
              setIsFirebaseAuthenticated(true);
              console.log('[AuthProvider] Synkronisering lyckades: NextAuth -> Firebase');
            } else {
              throw new Error(data.error || 'Okänt fel vid hämtning av Firebase-token');
            }
          } catch (error) {
            console.error('[AuthProvider] Fel vid Firebase-inloggning:', error);
            // Om detta misslyckas, logga ut helt för att undvika osynk
            await signOut(firebaseAuth);
            setIsFirebaseAuthenticated(false);
          }
        }
      } else if (status === 'unauthenticated') {
        // Användare är utloggad från NextAuth, säkerställ utloggning från Firebase
        if (isFirebaseAuthenticated) {
          await signOut(firebaseAuth);
          setIsFirebaseAuthenticated(false);
          console.log('[AuthProvider] Synkronisering: Utloggad från Firebase.');
        }
      }
    };

    syncAuth();

  }, [status, session, isFirebaseAuthenticated]);

  return <>{children}</>;
};

// =============================================================================
// HUVUDPROVIDER-KOMPONENT
// =============================================================================

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <FirebaseSync>
        {children}
      </FirebaseSync>
    </SessionProvider>
  );
};
