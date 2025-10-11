
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AppProviders from '@/providers/AppProviders'; // Den nya, korrekta providern
import OnboardingPage from '@/app/onboarding/page'; // Importera onboardingsidan
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "AI-assistent för byggbranschen som automatiserar administration och arbetsflöden.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Hämta sessionen på servern för att avgöra vad som ska renderas.
  const session = await getServerSession(authOptions);

  // Villkorlig rendering baserat på användarstatus
  const isNewUser = session?.user?.isNewUser ?? false;

  return (
    <html lang="sv">
      <body className={`${inter.className} h-full bg-background-primary text-text-primary`}>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            className: '',
            style: {
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
            },
          }}
        />
        {
          // Om användaren är ny, visa ENBART onboarding-sidan.
          isNewUser ? (
            <OnboardingPage />
          ) : (
            // Annars, rendera huvudapplikationen med alla nödvändiga providers.
            <AppProviders>
              {children}
            </AppProviders>
          )
        }
        <CookieBanner />
      </body>
    </html>
  );
}
