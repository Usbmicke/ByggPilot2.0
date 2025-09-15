import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextAuthProvider from '@/app/providers/NextAuthProvider'; // Ändrad import
import Navbar from '@/app/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ByggPilot',
  description: 'Mindre papperskaos. Mer tid att bygga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} bg-gray-100`}>
        <NextAuthProvider>
          <Navbar />
          {/* Main-taggen ger en standard-padding och ser till att innehållet inte hamnar under navbaren */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </NextAuthProvider> 
      </body>
    </html>
  );
}
