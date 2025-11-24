
'use client';

import React, { ReactNode } from 'react';

/**
 * GULDSTANDARD v15.0: Förenklad Client Provider
 * Denna komponent finns kvar som en central plats för framtida
 * klient-specifika providers (t.ex. ThemeProvider, SWRConfig, etc.),
 * men den hanterar inte längre autentisering.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  // AuthProvider är borttagen. Autentisering hanteras nu av server-side sessions,
  // middleware och den klient-sidiga `useUser` hooken.
  return <>{children}</>;
}
