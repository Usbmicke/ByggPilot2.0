
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, auth } from '@/components/AuthProvider';

const googleProvider = new GoogleAuthProvider();

// Ikoner för en enhetlig och modern design
const GoogleIcon = () => ( <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.251 46.944 30.861 46.944 24c0-1.341-.138-2.65-.389-3.917z"/></svg>);

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Omdirigering till onboarding om användaren redan är inloggad
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/onboarding');
    }
  }, [user, isLoading, router]);

  // Befintlig, fungerande inloggningslogik
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Omdirigering sköts av useEffect
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.code === 'auth/popup-closed-by-user' 
        ? 'Inloggningen avbröts.' 
        : 'Ett fel uppstod vid inloggning.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Modern laddningsskärm
  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg">Omdirigerar...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        
        {/* Korrekt sökväg och styling för logotypen */}
        <div className="mx-auto w-24 h-24 mb-6 relative">
             <Image 
              src="/logo.png" // Korrigerad sökväg
              alt="Byggpilot Logotyp"
              fill
              style={{ objectFit: 'contain' }}
              className='drop-shadow-lg' // Lägger till en subtil skugga
            />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-100">
          Välkommen till Byggpilot
        </h1>

        <p className="text-gray-400 mb-10 text-lg">
          Din digitala co-pilot för en enklare och mer lönsam byggvardag.
        </p>

        {/* Ny, moderniserad knapp som återanvänder befintlig funktion */}
        <button 
          onClick={handleGoogleSignIn} 
          disabled={isSigningIn}
          className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:cursor-not-allowed"
        >
           <GoogleIcon />
          {isSigningIn ? 'Loggar in...' : 'Logga in med Google'}
        </button>

        {error && <p className="text-red-400 mt-6">{error}</p>}

      </div>
       <footer className="absolute bottom-4 text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Byggpilot. Alla rättigheter förbehållna.</p>
      </footer>
    </main>
  );
}
