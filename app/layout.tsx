
import '@/config/env'; // Validerar miljövariabler vid appstart
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/app/providers';
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "AI-assistent för byggbranschen som automatiserar administration och arbetsflöden.",
};

// =================================================================================
// GULDSTANDARD - ROOTLAYOUT V2.0
// REVIDERING: All villkorlig logik för onboarding har tagits bort. Middleware
// är nu ensamt ansvarig för att styra användaren till rätt sida. Denna layout
// har nu ett enda ansvar: att rendera globala providers och sidans innehåll.
// Detta säkerställer att alla providers (inkl. UIProvider) ALLTID är tillgängliga
// för alla delar av applikationen, vilket löser "useUI must be used within..."-felet.
// =================================================================================
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} h-full bg-background-primary text-text-primary`}>
        <Providers>
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
          {/* {children} kommer antingen att vara Onboarding eller Dashboard, 
              bestämt av middleware. Båda kommer nu vara korrekt omslutna. */}
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
