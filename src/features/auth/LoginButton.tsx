
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/config/firebase-client';
import { Button } from '@/shared/ui/button';

// This component handles the entire client-side login flow.
export function LoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Trigger Google Sign-in Popup
      const provider = new GoogleAuthProvider();
      // Add all the required scopes for Google Workspace APIs
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.addScope('https://www.googleapis.com/auth/gmail.compose');
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/documents');
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      provider.addScope('https://www.googleapis.com/auth/tasks');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // 2. Get the Firebase ID token
        const idToken = await user.getIdToken(true);

        // 3. Send the token to our Genkit backend to create a session
        const response = await fetch('/api/genkit/flows/userSessionLogin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Genkit expects a body
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create session.');
        }

        // 4. On success, redirect to the onboarding page
        router.push('/onboarding');
      } else {
        throw new Error('Google sign-in failed. Please try again.');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handleLogin} disabled={isLoading} size="lg">
        {isLoading ? 'Loggar in...' : 'Logga in med Google'}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
