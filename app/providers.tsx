'use client';

import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/app/contexts/UIContext';
import { ChatProvider } from '@/app/contexts/ChatContext';
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner';

// =================================================================================
// PROVIDERS V10.0 - BORTTAG AV GAMLA CHATT-KOMPONENTER
// REVIDERING: Tog bort import och rendering av <Chat /> och <ChatBubble />.
// Dessa kommer att ersättas av en ny, integrerad chatt-komponent direkt i dashboard-layouten.
// =================================================================================
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UIProvider>
        <ChatProvider>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: '',
              style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
              },
            }}
          />
          {children}
          <CookieBanner />
        </ChatProvider>
      </UIProvider>
    </SessionProvider>
  );
}
