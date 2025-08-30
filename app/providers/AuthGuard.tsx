'use client';

import { useAuth } from './AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

// A loading component to show while authentication is in progress.
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0D1B2A', // brand-dark
    color: '#E0E1DD', // brand-text
    fontFamily: 'sans-serif'
  }}>
    Laddar...
  </div>
);

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until authentication is complete

    const isPrivateRoute = pathname.startsWith('/dashboard');

    // If user is logged IN and tries to access a PUBLIC route, redirect to dashboard.
    if (user && !isPrivateRoute) {
      router.push('/dashboard');
    }

    // If user is logged OUT and tries to access a PRIVATE route, redirect to home.
    if (!user && isPrivateRoute) {
      router.push('/');
    }

  }, [user, loading, pathname, router]);

  // While authentication is loading, show a full-screen loader.
  if (loading) {
    return <LoadingScreen />;
  }

  const isPrivateRoute = pathname.startsWith('/dashboard');

  // --- CRITICAL SECTION TO PREVENT CRASHES ---

  // If we are about to redirect a logged-out user away from a private route,
  // show a loader instead of rendering the (unauthorized) children.
  if (!user && isPrivateRoute) {
    return <LoadingScreen />;
  }

  // If we are about to redirect a logged-in user away from a public route,
  // show a loader instead of rendering the (soon-to-be-replaced) children.
  if (user && !isPrivateRoute) {
    return <LoadingScreen />;
  }
  
  // If none of the redirect conditions are met, it is safe to render the page content.
  return <>{children}</>;
};
