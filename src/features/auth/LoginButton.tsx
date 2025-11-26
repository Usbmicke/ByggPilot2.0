import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; 
import { runFlow } from '@genkit-ai/flow/client';
import { onboardingFlow } from '@/genkit/flows/onboardingFlow';
import { Button } from '@/shared/ui/button';

// Definiera alla nödvändiga scopes
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/drive.file', // För att skapa mappar/filer
  'https://www.googleapis.com/auth/tasks', 
];

export default function LoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const provider = new GoogleAuthProvider();
    // Lägg till alla scopes till providern
    GOOGLE_SCOPES.forEach(scope => provider.addScope(scope));

    try {
      // 1. Logga in med Google
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // 2. Kör onboardingFlow för att se om användaren är ny
      const { isNew } = await runFlow(onboardingFlow, { idToken });

      // 3. Omdirigera baserat på svar
      if (isNew) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError('Inloggningen misslyckades. Försök igen.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button 
        onClick={handleLogin} 
        disabled={isLoading}
        className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        {isLoading ? 'Loggar in...' : 'Logga in med Google'}
      </Button>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
