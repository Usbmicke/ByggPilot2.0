'use client';

import { signIn } from 'next-auth/react';

export default function TestPage() {
  return (
    <div style={{ padding: '5rem' }}>
      <h1>Autentiseringstest</h1>
      <p>Denna sida använder samma globala layout (RootLayout) som resten av appen.</p>
      <p>Om knappen nedan fungerar och startar Google-inloggningen, ligger problemet i en av de andra komponenterna som laddas på din vanliga landningssida.</p>
      <p>Om den INTE fungerar, ligger problemet i din RootLayout eller NextAuthProvider-konfiguration.</p>
      <hr style={{ margin: '2rem 0' }} />
      <button 
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })} 
        style={{ 
          fontSize: '1.2rem', 
          padding: '1rem 2rem', 
          cursor: 'pointer',
          backgroundColor: 'white',
          color: 'black'
        }}
      >
        Logga in med Google (Test)
      </button>
    </div>
  );
}
