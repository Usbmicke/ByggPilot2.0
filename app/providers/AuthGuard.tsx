'use client';

import { useAuth } from './AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, isDemo, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPrivateRoute = pathname.startsWith('/dashboard');
      
      // Omdirigera till dashboard om användaren är inloggad eller i demoläge
      if ((user || isDemo) && !isPrivateRoute) {
        router.push('/dashboard');
      }
      
      // Omdirigera till startsidan om varken inloggad eller i demoläge försöker nå en privat route
      if (!user && !isDemo && isPrivateRoute) {
        router.push('/');
      }
    }
  }, [user, isDemo, loading, pathname, router]);

  // Visa en laddningsindikator medan vi verifierar status
  // Detta förhindrar att en skyddad sida kort visas innan omdirigering
  if (loading || (!user && !isDemo && pathname.startsWith('/dashboard'))) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <p>Laddar...</p>
        </div>
    );
  }

  return <>{children}</>;
};
