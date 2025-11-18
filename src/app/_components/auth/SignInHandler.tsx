
'use client';

import { useState } from 'react';
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { LoginButtons } from './LoginButtons'; // Importerar den "dumma" knappen

// Importera Firebase-klientkonfigurationen som behövs
import { initializeApp, getApps, getApp, FirebaseApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const auth = getAuth(app);
// Slut på Firebase-klientkonfiguration


export const SignInHandler: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      // Nu anropar vi den `auth`-instans som skapats i denna fil
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Redirect Error:", error);
      setError('Kunde inte starta inloggningen. Vänligen försök igen.');
      setIsLoading(false);
    }
  };

  return (
    <LoginButtons 
      onGoogleSignIn={handleGoogleSignIn}
      isLoading={isLoading}
      error={error}
    />
  );
};
