'use client'
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import GoogleIcon from '@/components/icons/GoogleIcon';

const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-800 bg-neutral-100 border border-transparent rounded-full shadow-sm hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
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
