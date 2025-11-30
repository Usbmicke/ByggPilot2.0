
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider"; // FIX: Changed to named import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Byggpilot - Din Digitala Co-pilot",
  description: "En enklare och mer lönsam byggvardag.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
