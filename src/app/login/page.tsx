
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { useAuth } from '@/lib/auth/AuthProvider';
import { firebaseApp } from '@/lib/firebase/client';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Omdirigera användaren om de redan är inloggade och klara med auth-processen
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleLogin = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      // onIdTokenChanged i AuthProvider kommer automatiskt att upptäcka 
      // inloggningen och uppdatera kontexten. Omdirigering hanteras 
      // av useEffect-hooken.
      console.log('Successfully signed in!');
    } catch (error) {
      console.error('Login failed:', error);
      // Här kan du visa ett felmeddelande för användaren
    }
  };

  // Visa en laddningsindikator medan vi väntar på auth-status
  if (isLoading || user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Login</h1>
      <p>Please log in to continue.</p>
      <button onClick={handleLogin}>Log in with Google</button>
    </div>
  );
}
