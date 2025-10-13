
// Fil: app/providers.tsx
'use client'
import { SessionProvider } from 'next-auth/react'
import { UIProvider } from '@/contexts/UIContext' // <-- Importerad!

// =================================================================================
// GULDSTANDARD - PROVIDERS V2.0
// REVIDERING: Lade till UIProvider som omsluter children. Detta var den felande
// länken. Nu kommer alla sidor som renderas via RootLayout att ha tillgång till
// både session- och UI-kontexterna.
// =================================================================================
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </SessionProvider>
  )
}
