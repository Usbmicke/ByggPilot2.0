
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// =================================================================================
// AUTH PROVIDER V1.0 - PLATINUM STANDARD (KRASCH-FIX)
//
// Beskrivning: Denna komponent skapades för att lösa den fatala applikations-
// kraschen "`useSession` must be wrapped in a <SessionProvider />".
// Den agerar som en klient-sidig wrapper som tillhandahåller den nödvändiga
// SessionProvider-kontexten till hela applikationen, vilket är kritiskt för
// att `useSession`-hooken ska fungera.
// =================================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
