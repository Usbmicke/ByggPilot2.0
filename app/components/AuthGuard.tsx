'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * En skyddskomponent som säkerställer att användaren är inloggad.
 * Om användaren inte är inloggad och laddningen är klar,
 * omdirigeras de till landningssidan.
 * Visar en laddningsindikator medan autentiseringsstatus verifieras.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Omdirigera om laddningen är klar och det inte finns någon användare.
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Visa en laddningsskärm medan vi väntar på autentiseringsstatus.
  if (loading) {
    return <div className="fixed inset-0 bg-[#0B2545] flex items-center justify-center text-white">Verifierar användare...</div>;
  }

  // Om användaren är inloggad, rendera barnkomponenterna (den skyddade sidan).
  if (user) {
    return <>{children}</>;
  }

  // Returnera null (eller ingenting) medan omdirigering pågår för att förhindra
  // att den oskyddade sidan renderas en kort stund.
  return null;
}
