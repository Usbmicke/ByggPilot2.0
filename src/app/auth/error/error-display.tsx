'use client';

import { useSearchParams } from 'next/navigation';

const paragraphStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#D1D5DB', // Ljusgrå text
  marginBottom: '24px',
};

export default function ErrorDisplay() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Mappar tekniska felnamn till användarvänliga meddelanden.
  const errorMessages: { [key: string]: string } = {
    EmailRequired: 'Inloggning misslyckades. En giltig e-postadress från Google krävs för att kunna logga in på ByggPilot.',
    DatabaseError: 'Ett oväntat systemfel inträffade vid inloggningen. Vårt team har meddelats. Vänligen försök igen om en liten stund.',
    Default: 'Ett okänt fel inträffade under inloggningen. Vänligen försök igen.'
  };

  const message = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default;

  return <p style={paragraphStyle}>{message}</p>;
}
