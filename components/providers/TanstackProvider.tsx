
"use client"

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// =================================================================================
// TANSTACK PROVIDER (REACT QUERY) V1.0
// BESKRIVNING: En klient-komponent som sätter upp QueryClientProvider för 
// server-state-hantering med TanStack Query (React Query).
// Inkluderar ReactQueryDevtools för enklare utveckling.
// Steg A.4 i arkitekturplanen.
// =================================================================================

export default function TanstackProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
