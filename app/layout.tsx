// Fil: app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers' // <-- IMPORTERA

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ByggPilot',
  description: 'Din AI-assistent i byggbranschen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> {/* <-- OMSLUT */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
