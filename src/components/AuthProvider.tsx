'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client'; 
import { useRouter, usePathname } from 'next/navigation';
import { useGenkit } from '@/hooks/useGenkit';

// --- Helper: Full-page loading indicator ---
// This prevents the rest of the app from rendering and causing side effects during auth checks.
const GlobalLoadingScreen = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
    <div className="flex items-center space-x-3">
      <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-lg">Autentiserar & Laddar...</span>
    </div>
  </div>
);

// --- Interfaces & Context ---
interface UserProfile {
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  profile: UserProfile | null;
  isLoading: boolean; // Single source of truth for loading state
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
  profile: null,
  isLoading: true,
});

export const auth = getAuth(firebaseApp);

// --- The Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Is Firebase auth ready?
  
  const router = useRouter();
  const pathname = usePathname();

  // Step 1: Handle Firebase user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUser(user);
        setIdToken(token);
      } else {
        setUser(null);
        setIdToken(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Step 2: Fetch user profile from Genkit if the user is logged in
  const { data: profile, isLoading: isProfileLoading } = useGenkit<UserProfile>(
    !isAuthLoading && user ? 'getUserProfileFlow' : null
  );

  // This is the single source of truth for whether the app is ready.
  const isLoading = isAuthLoading || (user && isProfileLoading);

  // Step 3: Handle routing logic AFTER all loading is complete
  useEffect(() => {
    // Don't do anything until we have a definitive state
    if (isLoading) return;

    const isAuthPage = pathname === '/';
    const isOnboardingPage = pathname === '/onboarding';
    const hasCompletedOnboarding = !!profile?.companyName;

    // Condition 1: User is NOT logged in
    if (!user) {
      if (!isAuthPage) {
        router.push('/');
      }
      return;
    }

    // Condition 2: User IS logged in
    if (user) {
      if (hasCompletedOnboarding) {
        // User has finished onboarding, should be in the app
        if (isAuthPage || isOnboardingPage) {
          router.push('/dashboard');
        }
      } else {
        // User has NOT finished onboarding, must be sent there
        if (!isOnboardingPage) {
          router.push('/onboarding');
        }
      }
    }
  }, [isLoading, user, profile, pathname, router]);


  // THE FIX:
  // We provide the context value to all children, but we only render
  // a loading screen OR the children. This prevents the children
  // from being unmounted/remounted, which caused the redirect loop.
  return (
    <AuthContext.Provider value={{ user, idToken, profile, isLoading }}>
      {isLoading ? <GlobalLoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

// --- The Hook ---
export const useAuth = () => useContext(AuthContext);
