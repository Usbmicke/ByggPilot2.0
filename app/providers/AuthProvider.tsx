
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState, useContext, createContext, useMemo } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/client';

// Definiera en mer robust status-typ
type SyncStatus = 'loading' | 'synced' | 'error' | 'unauthenticated';

interface FirebaseSyncContextType {
  syncStatus: SyncStatus;
  firebaseUser: FirebaseUser | null;
}

// 1. Skapa en ny, mer informativ kontext
const FirebaseSyncContext = createContext<FirebaseSyncContextType>({ 
  syncStatus: 'loading', 
  firebaseUser: null 
});

// Exportera en custom hook för enkel åtkomst
export const useFirebaseSync = () => useContext(FirebaseSyncContext);

const FirebaseSyncManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status: nextAuthStatus } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncAuth = async () => {
      // Vänta på att NextAuth är klar
      if (nextAuthStatus === 'loading') {
        setSyncStatus('loading');
        return;
      }

      // Användare är inloggad i NextAuth
      if (nextAuthStatus === 'authenticated') {
        // Om vi redan har en Firebase-användare, är vi synkade.
        if (firebaseUser && firebaseUser.uid === session.user.id) {
            if (syncStatus !== 'synced') {
                setSyncStatus('synced');
                console.log('[AuthProvider] Status: Synced.');
            }
            return;
        }
        
        // Annars, försök att synka
        setSyncStatus('loading');
        console.log('[AuthProvider] NextAuth authenticated. Attempting Firebase sync...');
        try {
          const response = await fetch('/api/auth/firebase', { method: 'POST' });
          if (!response.ok) throw new Error(`Token fetch failed with status: ${response.status}`);
          
          const data = await response.json();
          if (data.firebaseToken) {
            await signInWithCustomToken(firebaseAuth, data.firebaseToken);
            // onAuthStateChanged kommer nu att uppdatera firebaseUser och trigga en omsynkning
            console.log('[AuthProvider] Firebase token received. Waiting for auth state change...');
          } else {
            throw new Error('Firebase token missing in response');
          }
        } catch (error) {
          console.error('[AuthProvider] Firebase sync error:', error);
          setSyncStatus('error');
        }
        return;
      }

      // Användare är utloggad från NextAuth
      if (nextAuthStatus === 'unauthenticated') {
        if (firebaseUser) {
            console.log('[AuthProvider] NextAuth unauthenticated. Signing out from Firebase.');
            await signOut(firebaseAuth);
        }
        setSyncStatus('unauthenticated');
      }
    };

    syncAuth();
  // Körs när NextAuth-status eller Firebase-användarobjektet ändras
  }, [nextAuthStatus, firebaseUser, session, syncStatus]);

  // Använd useMemo för att undvika onödiga omrenderingar av kontext-värdet
  const contextValue = useMemo(() => ({ syncStatus, firebaseUser }), [syncStatus, firebaseUser]);

  return (
    <FirebaseSyncContext.Provider value={contextValue}>
      {children}
    </FirebaseSyncContext.Provider>
  );
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
