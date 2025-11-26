
'use client';

import { AuthProvider } from '@/lib/firebase/client/auth';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
