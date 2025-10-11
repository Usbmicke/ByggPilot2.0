
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import Providers from '@/providers';
import OnboardingPage from '@/onboarding/page';
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "AI-assistent för byggbranschen som automatiserar administration och arbetsflöden.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

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
          isNewUser ? (
            <OnboardingPage />
          ) : (
            <Providers>
              {children}
            </Providers>
          )
        }
        <CookieBanner />
      </body>
    </html>
  );
}
