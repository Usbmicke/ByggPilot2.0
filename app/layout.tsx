import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextAuthProvider from '@/app/providers/NextAuthProvider'; // Corrected import path

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ByggPilot',
  description: 'Mindre papperskaos. Mer tid att bygga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} bg-gray-900`}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
