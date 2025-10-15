'use client'
import { SessionProvider } from 'next-auth/react'
import { UIProvider } from '@/contexts/UIContext'

// =================================================================================
// GULDSTANDARD - PROVIDERS V7.0 - FÖRENKLAD
// REVIDERING: Återställd till en ren provider-envelop. Ansvaret för ChatProvider
// och Chat-komponenten har flyttats direkt till layout.tsx för att garantera
// korrekt renderingsordning och eliminera kontext-felet.
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
