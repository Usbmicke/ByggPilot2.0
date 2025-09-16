import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/components/Providers"; // Importera den korrekta providern

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "Mindre papperskaos. Mer tid att bygga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        {/* Omslut med den nya providern som innehåller SessionProvider */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
