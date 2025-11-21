
'use client';

import React, { ReactNode } from 'react';
import { FirebaseAuthHandler } from '@/app/_components/auth/FirebaseAuthHandler';

/**
 * ClientProviders är en samlingskomponent för alla globala klient-sidans providers.
 * Genom att placera dem här hålls rotlayouten ren och fokuserad.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Denna komponent hanterar synkroniseringen mellan Firebase Auth och vår server-session. */}
      <FirebaseAuthHandler />
      
      {/* Här kan andra globala providers läggas till i framtiden, t.ex. ThemeProvider, QueryClientProvider, etc. */}
      {children}
    </>
  );
}
