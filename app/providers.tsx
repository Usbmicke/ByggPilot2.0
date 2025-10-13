
// Fil: app/providers.tsx
'use client'
import { SessionProvider } from 'next-auth/react'
import { UIProvider } from '@/contexts/UIContext'
import { ChatProvider } from '@/contexts/ChatContext'; // <-- Importerad!

// =================================================================================
// GULDSTANDARD - PROVIDERS V3.0
// REVIDERING: Lade till ChatProvider. Detta löser kraschen "useChat must be 
// used within a ChatProvider" genom att göra chatt-kontexten tillgänglig
// för hela applikationen, precis som för session och UI.
// =================================================================================
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider> {/** <-- Lades till här **/} 
        <UIProvider>
          {children}
        </UIProvider>
      </ChatProvider>
    </SessionProvider>
  )
}
