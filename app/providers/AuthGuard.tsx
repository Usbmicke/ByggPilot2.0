'use client';

import { useAuth } from './AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPrivateRoute = pathname.startsWith('/dashboard');
      
      if (user && !isPrivateRoute) {
        router.push('/dashboard');
      }
      
      if (!user && isPrivateRoute) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div>Laddar...</div>;
  }

  return <>{children}</>;
};
