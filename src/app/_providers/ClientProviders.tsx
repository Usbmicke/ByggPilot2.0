
'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/app/_lib/context/AuthContext';

/**
 * ClientProviders är en samlingskomponent för alla globala klient-sidans providers.
 * Genom att placera dem här hålls rotlayouten ren och fokuserad.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    // AuthProvider innehåller nu ALL autentiseringslogik,
    // inklusive synkronisering med Firebase Auth och server-sessioner.
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
