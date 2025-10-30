
'use client'
import { signIn } from 'next-auth/react';
import GoogleIcon from '@/app/components/icons/GoogleIcon';

const LoginButtons = () => {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <GoogleIcon className="-ml-1 mr-2 h-5 w-5" />
        Logga in med Google
      </button>
    </div>
  );
};

export default LoginButtons;
