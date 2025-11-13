'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { NextUIProvider } from '@nextui-org/react';
import React from 'react';

// Denna komponent agerar som en central hub för alla klient-sidiga providers.
// Allt inuti den är garanterat att bara rendreras på klienten.
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextUIProvider>
  );
}
