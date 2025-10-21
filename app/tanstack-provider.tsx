
'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// =================================================================================
// TANSTACK PROVIDER (v2.0 - "OPERATION PREMIUM CHATT")
// Beskrivning: Konfigurerar TanStack Query (React Query) för datahämtning.
// v2.0:
//    - PRODUKTIONS-SÄKER: `ReactQueryDevtools` renderas nu ENDAST i utvecklingsläge,
//      vilket tar bort ikonen från produktionsversionen.
// =================================================================================

function TanstackProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default TanstackProvider;
