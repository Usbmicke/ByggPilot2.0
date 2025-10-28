
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { UIProvider } from "@/app/contexts/UIContext";
import { ModalProvider } from "@/app/contexts/ModalContext";
import ModalRenderer from "@/app/components/layout/ModalRenderer";
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
        <UIProvider>
          <AuthProvider>
              <ModalProvider>
                {children}
                <ModalRenderer />
              </ModalProvider>
          </AuthProvider>
        </UIProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
