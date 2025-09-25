
'use client'
import { signIn } from 'next-auth/react';
import GoogleIcon from '@/app/components/icons/GoogleIcon';

const LoginButtons = () => {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex flex-col items-center w-full mt-8">
      {/* ---- Uppdaterad Google-knapp ---- */}
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center w-full max-w-xs px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
        aria-label="Logga in med Google"
      >
        <GoogleIcon />
        Logga in med Google
      </button>
      
      {/* 
        Här kan man i framtiden lägga till andra inloggningsmetoder, 
        t.ex. med e-post och lösenord, BankID, etc.

        <div className="my-4 text-center text-gray-500">eller</div>

        <button className="...andra inloggningsknappar...">
          Logga in med BankID
        </button>
      */}
    </div>
  );
};

export default LoginButtons;
