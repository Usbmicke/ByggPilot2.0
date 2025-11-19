
'use client';

import { useSignIn } from '@/app/_hooks/useSignIn';
import { LoginButtons } from './LoginButtons';

// =======================================================================
//  SIGN IN HANDLER (VERSION 2.0 - REFAKTORISERAD)
//  Använder nu den centraliserade useSignIn-hooken. Denna komponent
//  fungerar som en enkel "brygga" mellan hooken och UI-komponenten.
// =======================================================================

export const SignInHandler: React.FC = () => {
  const { handleGoogleSignIn, isLoading, error } = useSignIn();

  return (
    <LoginButtons 
      onGoogleSignIn={handleGoogleSignIn}
      isLoading={isLoading}
      error={error}
    />
  );
};
