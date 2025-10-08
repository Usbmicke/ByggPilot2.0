
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "AI-assistent för byggbranschen som automatiserar administration och arbetsflöden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <AuthProvider>
          {children}
        </AuthProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
