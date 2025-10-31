
'use client'; // Måste vara en client component för att kunna använda onClick-events och signIn.

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc'; // Google-ikon för knappen

// =================================================================================
// INLOGGNINGSSIDA V2.0 - POPUP-FLÖDE
// =================================================================================
// Denna sida startar inloggningsprocessen. När knappen klickas,
// hanterar next-auth automatiskt inloggningen i ett popup-fönster.

export default function LoginPage() {

  // Denna funktion anropas när användaren klickar på knappen.
  // next-auth öppnar ett popup-fönster för Google-autentisering.
  // Efter lyckad inloggning omdirigeras huvudsidan till /dashboard.
  const handlePopupLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Åtkomst krävs</h1>
        <p className="text-gray-600 mb-6">Vänligen logga in med ditt Google-konto för att få tillgång till plattformen och alla dess funktioner.</p>
        
        <button 
          onClick={handlePopupLogin}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FcGoogle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Fortsätt med Google
        </button>
      </div>
    </div>
  );
}

