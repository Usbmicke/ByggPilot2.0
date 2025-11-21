
'use client';

import React, { ReactNode } from 'react';
import { FirebaseAuthHandler } from '@/app/_components/auth/FirebaseAuthHandler';
import { AuthProvider } from '@/app/_lib/context/AuthContext'; // IMPORTERA AuthProvider

/**
 * ClientProviders är en samlingskomponent för alla globala klient-sidans providers.
 * Genom att placera dem här hålls rotlayouten ren och fokuserad.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Denna komponent hanterar synkroniseringen mellan Firebase Auth och vår server-session. */}
      <FirebaseAuthHandler />

      {/* Denna Provider hämtar användardata från /api/user/me och gör den tillgänglig för klient-komponenter */}
      <AuthProvider>
        {children}
      </AuthProvider>
    </>
  );
}
