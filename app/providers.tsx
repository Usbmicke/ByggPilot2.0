
'use client';

import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/contexts/UIContext';
import { ChatProvider } from '@/contexts/ChatContext'; // Importera den nya ChatProvider
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UIProvider>
        <ChatProvider> {/* Lägg till ChatProvider här */}
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
