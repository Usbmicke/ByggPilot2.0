
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { UIProvider } from "@/contexts/UIContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { TourProvider } from "@/contexts/TourContext";
import TourStep from "@/components/tour/TourStep";
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
        <UIProvider>
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
            <ChatProvider>
                <TourProvider>
                  {children}
                  <TourStep />
                </TourProvider>
            </ChatProvider>
          </AuthProvider>
        </UIProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
