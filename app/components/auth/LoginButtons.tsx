
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
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <GoogleIcon className="-ml-1 mr-3 h-5 w-5" />
      Logga in med Google
    </button>
  );
};

export default LoginButtons;
