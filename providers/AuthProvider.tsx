
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState, useContext, createContext, useMemo } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { UIProvider } from '@/contexts/UIContext'; // IMPORTERAD
import { ChatProvider } from '@/contexts/ChatContext'; // IMPORTERAD

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
      if (nextAuthStatus === 'loading') {
        setSyncStatus('loading');
        return;
      }

      if (nextAuthStatus === 'authenticated') {
        if (firebaseUser && firebaseUser.uid === session.user.id) {
            if (syncStatus !== 'synced') {
                setSyncStatus('synced');
                console.log('[AuthProvider] Status: Synced.');
            }
            return;
        }
        
        setSyncStatus('loading');
        console.log('[AuthProvider] NextAuth authenticated. Attempting Firebase sync...');
        try {
          const response = await fetch('/api/auth/firebase', { method: 'POST' });
          if (!response.ok) throw new Error(`Token fetch failed with status: ${response.status}`);
          
          const data = await response.json();
          if (data.firebaseToken) {
            await signInWithCustomToken(firebaseAuth, data.firebaseToken);
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

      if (nextAuthStatus === 'unauthenticated') {
        if (firebaseUser) {
            console.log('[AuthProvider] NextAuth unauthenticated. Signing out from Firebase.');
            await signOut(firebaseAuth);
        }
        setSyncStatus('unauthenticated');
      }
    };

    syncAuth();
  }, [nextAuthStatus, firebaseUser, session, syncStatus]);

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
        <UIProvider>  {/* KORRIGERAD: UIProvider omsluter nu appen */}
          <ChatProvider> {/* KORRIGERAD: ChatProvider omsluter nu appen */}
            {children}
          </ChatProvider>
        </UIProvider>
      </FirebaseSyncManager>
    </SessionProvider>
  );
};
