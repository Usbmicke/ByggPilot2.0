
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { auth as firebaseAuth } from '@/app/lib/firebase/client';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { useUI } from '@/app/contexts/UIContext'; // **STEG 1: Importera useUI**

// =============================================================================
// HJÄRNAN FÖR SYNKRONISERING OCH ONBOARDING
// =============================================================================

const FirebaseSyncAndOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const ui = useUI(); // **STEG 2: Hämta UI-kontexten**

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
  }, [status, session, isFirebaseAuthenticated]);

  // **STEG 3: Effekt för att hantera Onboarding**
  useEffect(() => {
    // Kör bara när sessionen är fullt laddad och autentiserad
    if (status === 'authenticated' && session) {
      // @ts-ignore - Vi vet att isNewUser finns baserat på vår backend-logik
      if (session.user?.isNewUser) {
        // Öppna onboarding-modalen. Vi använder en liten fördröjning
        // för att säkerställa att all rendering är klar och upplevelsen blir mjukare.
        setTimeout(() => {
          ui.openModal('companyVision');
        }, 1000); // 1 sekunds fördröjning
      }
    }
  // Vi vill att denna effekt endast ska köras en gång när sessionen blir autentiserad.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  return <>{children}</>;
};

// =============================================================================
// HUVUDPROVIDER-KOMPONENT
// =============================================================================

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <FirebaseSyncAndOnboarding>
        {children}
      </FirebaseSyncAndOnboarding>
    </SessionProvider>
  );
};
