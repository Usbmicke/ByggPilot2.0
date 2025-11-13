
'use client';

import { AuthProvider } from '@/lib/firebase/AuthProvider';
import React from 'react';

// Denna komponent agerar som en gräns. Allt inuti den är garanterat
// att bara rendreras på klienten.
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
