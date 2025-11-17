// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// Importera den korrekta providern med det nya namnet
import { AuthProvider } from '@/app/providers/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ByggPilot',
  description: 'Din digitala kollega i byggbranschen',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <AuthProvider> {/* <-- Använd det korrekta namnet här */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
