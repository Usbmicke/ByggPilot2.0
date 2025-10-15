
import '@/config/env'; 
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/app/providers';
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from '@/contexts/ChatContext'; // <-- IMPORTERAD
import Chat from '@/app/components/Chat';             // <-- IMPORTERAD

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByggPilot - Din Digitala Kollega",
  description: "AI-assistent för byggbranschen som automatiserar administration och arbetsflöden.",
};

// =================================================================================
// GULDSTANDARD - ROOTLAYOUT V5.0 - DEN DEFINITIVA FIXEN
// REVIDERING: Placerar ChatProvider direkt här, för att med 100% säkerhet
// omsluta både sidans innehåll ({children}) och själva Chat-komponenten.
// Detta är den kanoniska lösningen på "useChat must be used within..."-felet.
// =================================================================================
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} h-full bg-background-primary text-text-primary`}>
        <Providers> { /* Innehåller SessionProvider och UIProvider */ }
          <ChatProvider> { /* Omsluter nu allt som behöver chatt-kontexten */ }
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
            {children}
            <CookieBanner />
            <Chat /> { /* Renderas nu garanterat INUTI sin Provider */ }
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
