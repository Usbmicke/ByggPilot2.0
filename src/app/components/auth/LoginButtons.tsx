'use client'
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import GoogleIcon from '@/app/components/icons/GoogleIcon';

const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Använd signIn med omdirigering. NextAuth hanterar resten.
    // Användaren lämnar sidan, så vi behöver inte återställa isLoading.
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {isLoading ? (
        <span>Omdirigerar...</span>
      ) : (
        <>
          <GoogleIcon className="-ml-1 mr-2 h-4 w-4" />
          Logga in med Google
        </>
      )}
    </button>
  );
};

export default LoginButtons;
