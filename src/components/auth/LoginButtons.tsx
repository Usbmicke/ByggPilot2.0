'use client';

import { useState } from 'react';
import { setPersistence, browserLocalPersistence, signInWithRedirect, GoogleAuthProvider } from "@firebase/auth";
import { auth } from '@/lib/config/firebase-client'; // <-- KORRIGERAD SÖKVÄG
import { FaGoogle } from 'react-icons/fa';

interface LoginButtonsProps {
  onAuthSuccess?: () => void;
}

export const LoginButtons: React.FC<LoginButtonsProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    // --- START: Utökade Google API Scopes ---
    // Dessa scopes är nödvändiga för kärnfunktionaliteten i ByggPilot.
    provider.addScope('profile');
    provider.addScope('email');

    // Google Calendar (läsa/skriva)
    provider.addScope('https://www.googleapis.com/auth/calendar');

    // Google Drive (full åtkomst till filer, inkluderar Docs, Sheets etc.)
    provider.addScope('https://www.googleapis.com/auth/drive');

    // Gmail (läsa och skicka, för att kunna analysera och skapa utkast)
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');

    // Google Tasks (läsa/skriva)
    provider.addScope('https://www.googleapis.com/auth/tasks');
    // --- SLUT: Utökade Google API Scopes ---

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Fel vid Google inloggning:", error);
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={!isLoading ? handleGoogleSignIn : undefined}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <FaGoogle />
        <span>
          {isLoading ? 'Omdirigerar...' : 'Logga in med Google'}
        </span>
      </button>
    </div>
  );
};
