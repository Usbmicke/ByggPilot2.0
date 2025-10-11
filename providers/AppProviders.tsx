
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ChatProvider } from '@/contexts/ChatContext';

// =================================================================================
// GULDSTANDARD: APP PROVIDERS v1.0
// BESKRIVNING: Denna komponent agerar som en centraliserad container för alla
// applikationens context providers. Genom att linda in SessionProvider *runt*
// ChatProvider säkerställer vi att hooks som anropas inuti ChatProvider (som useSession)
// har tillgång till den nödvändiga kontexten, vilket löser renderingsfelet.
// =================================================================================

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      {/* ChatProvider är nu korrekt nästlad inuti SessionProvider */}
      <ChatProvider>
        {children}
      </ChatProvider>
    </SessionProvider>
  );
}
