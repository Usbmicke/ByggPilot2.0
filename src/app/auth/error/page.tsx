import Link from 'next/link';
import { Suspense } from 'react';
import ErrorDisplay from './error-display';

// Enkel, centrerad layout för att matcha resten av appens känsla.
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  textAlign: 'center',
  padding: '20px',
  color: '#ffffff', // Vit text
};

const boxStyle: React.CSSProperties = {
    background: 'rgba(31, 41, 55, 0.7)', // Mörkgrå, halv-transparent bakgrund
    border: '1px solid #4B5563', // Grå border
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '16px',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 24px',
  background: '#3B82F6', // Blå knapp
  color: '#ffffff',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '500',
};

export default function AuthErrorPage() {
  return (
    <div style={containerStyle}>
        <div style={boxStyle}>
            <h1 style={headingStyle}>Oj, något gick fel</h1>
            <Suspense fallback={<p>Hämtar felinformation...</p>}>
              <ErrorDisplay />
            </Suspense>
            <Link href="/" style={linkStyle}>
                Tillbaka till startsidan
            </Link>
        </div>
    </div>
  );
}
