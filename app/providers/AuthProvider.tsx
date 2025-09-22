
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Detta är en "Provider"-komponent. Dess enda syfte är att göra
// inloggningsinformation (sessionen) tillgänglig för alla komponenter
// som renderas på klientsidan. Den måste vara en 'use client'-komponent.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
