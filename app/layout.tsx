
import './globals.css';
import NextAuthProvider from '@/app/providers/NextAuthProvider'; // Uppdaterad import

export const metadata = {
  title: 'ByggPilot',
  description: 'Mindre papperskaos. Mer tid att bygga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <NextAuthProvider> 
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
