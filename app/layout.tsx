
import './globals.css';
import { AuthProvider } from '@/app/providers/AuthContext'; // STEG 1: Korrigerad import

export const metadata = {
  title: 'ByggPilot',
  description: 'Mindre papperskaos. Mer tid att bygga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        {/* STEG 2: Använd den korrekta providern */}
        <AuthProvider> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
