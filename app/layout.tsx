
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { UIProvider } from "@/app/contexts/UIContext";
import { ChatProvider } from "@/app/contexts/ChatContext";
import { ModalProvider } from "@/app/context/ModalContext"; // GULDSTANDARD-TILLÄGG
import ModalRenderer from "@/app/components/layout/ModalRenderer"; // GULDSTANDARD-TILLÄGG
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
            <ChatProvider>
              <ModalProvider> {/* GULDSTANDARD-TILLÄGG */}
                {children}
                <ModalRenderer /> {/* GULDSTANDARD-TILLÄGG */}
              </ModalProvider>
            </ChatProvider>
          </AuthProvider>
        </UIProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
