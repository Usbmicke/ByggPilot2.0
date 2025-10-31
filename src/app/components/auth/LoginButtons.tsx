
'use client'
import { signIn } from 'next-auth/react';
import GoogleIcon from '@/app/components/icons/GoogleIcon';

const LoginButtons = () => {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-neutral-100 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 whitespace-nowrap"
    >
      <GoogleIcon className="-ml-1 mr-2 h-4 w-4" />
      Logga in
    </button>
  );
};

export default LoginButtons;
