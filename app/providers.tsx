'use client';

import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/contexts/UIContext';
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner';
import TanstackProvider from '@/components/providers/TanstackProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TanstackProvider>
        <UIProvider>
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
        </UIProvider>
      </TanstackProvider>
    </SessionProvider>
  );
}
