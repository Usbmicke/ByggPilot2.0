
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Denna sida fungerar nu som en enkel omdirigering till den faktiska projektlistan.
// Allt gammalt demo-innehåll har tagits bort för att undvika fel och förvirring.
const DashboardRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/projects');
  }, [router]);

  return (
    <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-400">Omdirigerar till dina projekt...</p>
    </div>
  );
};

export default DashboardRedirectPage;

