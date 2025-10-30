
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Verifieringssida (Vattenfallsmetoden)
 * Denna sida är det andra steget i den säkra onboarding-processen.
 * 1. Användaren landar här från /onboarding.
 * 2. Vid denna punkt är JWT-token garanterat uppdaterad.
 * 3. En useEffect-hook triggas omedelbart och navigerar användaren till /dashboard.
 * Proxy-vakten kommer nu att se den korrekta, uppdaterade token och godkänna navigeringen.
 */
export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // Navigera omedelbart vidare till instrumentpanelen.
    router.push('/dashboard');
  }, [router]);

  // Renderar en enkel laddningsindikator medan omdirigering sker.
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <p className="text-white">Verifierar och omdirigerar...</p>
      </div>
    </div>
  );
}

