'use client';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase/client'; // Klient-side Firebase-konfiguration
import { Button } from '@/shared/ui/button'; // Vårt designsystem

export function LoginForm() {
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogin = async () => {
    try {
      // 1. Starta Google-inloggning
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const token = await userCred.user.getIdToken();

      // 2. Skicka token till Genkit för att skapa session-cookie
      // Anropet går via Next.js-proxyn till Genkit-servern
      const response = await fetch('/api/genkit/flows/userSessionLogin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: {} }) // Tom body, allt finns i headern
      });

      if (!response.ok) {
        throw new Error('Session creation failed.');
      }

      // 3. Klart! Cookien är satt. Omdirigera till onboarding.
      // En fullständig sidomladdning är bra här för att säkerställa att all server-side state uppdateras.
      window.location.href = '/onboarding';

    } catch (error) {
      console.error("Login failed:", error);
      // TODO: Visa ett felmeddelande för användaren
    }
  };

  return <Button onClick={handleLogin}>Logga in med Google</Button>;
}
