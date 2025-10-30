
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // Korrigerad relativ sökväg
import { UIProvider } from "./contexts/UIContext"; // Korrigerad relativ sökväg
import { ModalProvider } from "./contexts/ModalContext"; // Korrigerad relativ sökväg
import ModalRenderer from "./components/layout/ModalRenderer"; // Korrigerad relativ sökväg
import CookieBanner from "./components/CookieBanner"; // KORRIGERING: Använd relativ sökväg för att säkerställa rätt komponent

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
