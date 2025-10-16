'use client';

import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/contexts/UIContext';
import { ChatProvider } from '@/contexts/ChatContext';
import Chat from '@/app/components/Chat';
import ChatBubble from '@/app/components/ChatBubble';
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner';

// =================================================================================
// PROVIDERS V8.0 - KORREKT ARKITEKTUR
// REVIDERING: Denna fil är nu den centrala klient-hubben. Den initierar ALLA
// providers och renderar sedan både sidinnehållet ({children}) och alla
// globala UI-komponenter (Chat, ChatBubble, etc.) INUTI dessa providers.
// Detta garanterar att kontexten alltid är tillgänglig.
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
          <Chat />
          <ChatBubble />
        </ChatProvider>
      </UIProvider>
    </SessionProvider>
  );
}
