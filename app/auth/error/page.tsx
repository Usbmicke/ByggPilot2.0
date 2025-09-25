'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

const paragraphStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#D1D5DB', // Ljusgrå text
  marginBottom: '24px',
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
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Mappar tekniska felnamn till användarvänliga meddelanden.
  const errorMessages: { [key: string]: string } = {
    EmailRequired: 'Inloggning misslyckades. En giltig e-postadress från Google krävs för att kunna logga in på ByggPilot.',
    DatabaseError: 'Ett oväntat systemfel inträffade vid inloggningen. Vårt team har meddelats. Vänligen försök igen om en liten stund.',
    Default: 'Ett okänt fel inträffade under inloggningen. Vänligen försök igen.'
  };

  const message = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default;

  return (
    <div style={containerStyle}>
        <div style={boxStyle}>
            <h1 style={headingStyle}>Oj, något gick fel</h1>
            <p style={paragraphStyle}>{message}</p>
            <Link href="/" style={linkStyle}>
                Tillbaka till startsidan
            </Link>
        </div>
    </div>
  );
}
