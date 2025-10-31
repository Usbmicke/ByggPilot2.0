import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import Providers from './components/Providers'; // Korrigerad import

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
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers> {/* Korrigerad komponent */}
        <audio id="background-audio" loop>
          <source src="https://aistudio-app-assets.google.com/dev/serve/249852a4-b997-4253-b0f3-a3d8b8a5423c" type="audio/mpeg" />
        </audio>
      </body>
    </html>
  )
}