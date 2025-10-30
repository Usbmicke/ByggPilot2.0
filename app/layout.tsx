
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers"; // Importera den korrekta provider-filen
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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <UIProvider>
            <ModalProvider>
              {children}
              <ModalRenderer />
              <CookieBanner />
            </ModalProvider>
          </UIProvider>
        </Providers>
      </body>
    </html>
  );
}
