
import '@/config/env';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/app/providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "AI-assistent för byggbranschen som automatiserar administration och arbetsflöden.",
};

// =================================================================================
// ROOTLAYOUT V7.0 - KORREKT ARKITEKTUR
// REVIDERING: Detta är den slutgiltiga, rena layout-filen. Den är en Server-
// komponent som endast ansvarar för grundläggande HTML och att omsluta allt
// med den centrala <Providers> klient-komponenten. All annan logik har
// flyttats till providers.tsx, vilket löser kontext-problemet permanent.
// =================================================================================
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} h-full bg-background-primary text-text-primary`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
