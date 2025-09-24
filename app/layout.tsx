
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { UIProvider } from "@/app/contexts/UIContext";
import { ChatProvider } from "@/app/contexts/ChatContext";
import CookieBanner from "@/app/components/CookieBanner";

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
        {/*
          KORREKT PROVIDER-ORDNING:
          1. UIProvider: Tillhandahåller UI-kontext (t.ex. för att öppna modaler).
          2. AuthProvider: Använder UI-kontexten för onboarding och hanterar session-data.
          3. ChatProvider: Använder både UI- och Auth-kontexter.
        */}
        <UIProvider>
          <AuthProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </AuthProvider>
        </UIProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
