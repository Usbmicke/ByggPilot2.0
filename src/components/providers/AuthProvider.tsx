'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@firebase/auth';
import { auth } from '@/lib/config/firebase-client';
import { getFunctions, httpsCallable } from '@firebase/functions';

// Denna status används nu bara för att informera UI-komponenter, inte för omdirigering.
type AppStatus = 'LOADING' | 'NEEDS_ONBOARDING' | 'READY' | 'LOGGED_OUT';

interface AuthContextType {
  user: User | null;
  appStatus: AppStatus;
}

const AuthContext = createContext<AuthContextType>({ user: null, appStatus: 'LOADING' });

// Helper för att sätta en cookie som proxyn kan läsa
const setStatusCookie = (status: 'incomplete' | 'complete' | 'logged_out') => {
  // Sätt en cookie som är giltig i hela siten i 24 timmar.
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `onboardingStatus=${status}; path=/; expires=${expires}`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>('LOADING');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const functions = getFunctions(auth.app, 'europe-west1');
          const checkStatus = httpsCallable(functions, 'getOrCreateUserAndCheckStatusFlow');
          const response = await checkStatus();
          const data = response.data as { isOnboarded: boolean };

          if (data.isOnboarded) {
            setAppStatus('READY');
            setStatusCookie('complete');
          } else {
            setAppStatus('NEEDS_ONBOARDING');
            setStatusCookie('incomplete');
          }
        } catch (error) {
          console.error("[AuthProvider] Kunde inte verifiera användarstatus:", error);
          setAppStatus('LOGGED_OUT');
          setStatusCookie('logged_out');
        }
      } else {
        setUser(null);
        setAppStatus('LOGGED_OUT');
        setStatusCookie('logged_out');
      }
    });

    return () => unsubscribe();
  }, []);

  if (appStatus === 'LOADING') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Laddar ByggPilot...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, appStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
