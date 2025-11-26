
import { Providers } from "@/app/providers";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthHandler from "./AuthHandler"; // Import the new handler

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ByggPilot",
  description: "AI-driven development assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthHandler>{children}</AuthHandler>
        </Providers>
      </body>
    </html>
  );
}
