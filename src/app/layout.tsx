import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import Providers from './components/Providers';
import Script from 'next/script'; // Importera Script-komponenten

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ByggPilot - AI Automation',
  description: 'AI för hantverkare. På riktigt. Automatisera KMA, säkra din ekonomi och stoppa byggfelen innan de ens sker.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <head>
        {/* LÄGGER TILL THREE.JS GLOBALT */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
        {/* BORTTAGEN trasig ljud-tagg för att rensa konsol-fel, enligt Steg 5 i planen */}
      </body>
    </html>
  )
}
