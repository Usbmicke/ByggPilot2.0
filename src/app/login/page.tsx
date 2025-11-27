'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { auth } from '@/lib/firebase/client';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Om användaren redan är inloggad, omdirigera till startsidan
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Omdirigering hanteras av useEffect
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  if (loading || user) {
    // Visa en laddningssida medan vi verifierar status eller omdirigerar
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Welcome to ByggPilot</h1>
      <p>Please log in to continue</p>
      <button onClick={handleLogin}>Log In with Google</button>
    </div>
  );
}
