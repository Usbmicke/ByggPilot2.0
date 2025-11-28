
'use client'; // AuthProvider och hooks kräver detta

import { Inter } from "next/font/google";
import "./globals.css";
// KORREKT IMPORT från den nya, centrala AuthProvider-filen
import { AuthProvider } from "@/lib/auth/AuthProvider"; 

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Omslut hela applikationen med AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
