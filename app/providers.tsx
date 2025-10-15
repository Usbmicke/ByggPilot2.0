
// Fil: app/providers.tsx
'use client'
import { SessionProvider } from 'next-auth/react'
import { UIProvider } from '@/contexts/UIContext' // <-- ÅTERSTÄLLD
import { ChatProvider } from '@/contexts/ChatContext';

// =================================================================================
// GULDSTANDARD - PROVIDERS V5.0
// REVIDERING: Återaktiverade UIProvider efter att ha skapat en ny, säker version
// av UIContext.tsx. All grundläggande funktionalitet är nu återställd och stabil.
// =================================================================================
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider>
        <UIProvider> {/** <-- ÅTERSTÄLLD **/} 
          {children}
        </UIProvider>
      </ChatProvider>
    </SessionProvider>
  )
}
