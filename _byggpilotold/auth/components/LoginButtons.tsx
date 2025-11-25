
'use client';

import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

interface LoginButtonsProps {
  onGoogleSignIn: () => Promise<void>; // Denna komponent vet inte längre HUR inloggningen sker, bara ATT den kan anropas.
  isLoading: boolean;
  error: string | null;
}

export const LoginButtons: React.FC<LoginButtonsProps> = ({ onGoogleSignIn, isLoading, error }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={onGoogleSignIn} // Anropar funktionen som skickas via props.
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <FaGoogle />
        <span>
          {isLoading ? 'Omdirigerar till Google...' : 'Logga in med Google'}
        </span>
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
