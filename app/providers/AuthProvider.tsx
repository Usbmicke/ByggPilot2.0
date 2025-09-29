
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState, useTransition } from 'react';
import { auth as firebaseAuth } from '@/app/lib/firebase/client';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

const FirebaseSyncManager = ({ children }: { children: React.ReactNode }) => {
  // ANVÄND UPDATE-FUNKTIONEN FRÅN USESESSION
  const { data: session, status, update } = useSession();
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

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

              // **DEN SLUTGILTIGA FIXEN: REVALIDERING AV SESSION**
              // @ts-ignore
              if (session.user?.isNewUser) {
                // Använd startTransition för att undvika abrupta UI-förändringar under uppdateringen
                startTransition(async () => {
                  console.log('[AuthProvider] Ny användare upptäckt. Validerar sessionen mot servern...');
                  const newSession = await update(); // Tvinga fram en uppdatering från servern
                  
                  // @ts-ignore
                  if (newSession?.user?.isNewUser && pathname !== '/onboarding') {
                    console.log('[AuthProvider] Validering klar. Användaren är fortfarande ny. Omdirigerar till /onboarding.');
                    router.push('/onboarding');
                  } else {
                    console.log('[AuthProvider] Validering klar. Användaren har slutfört onboarding. Ingen omdirigering behövs.');
                  }
                });
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
  }, [status, session, pathname]); // Behåll dependencies som de är

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
