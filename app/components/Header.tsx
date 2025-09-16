'use client';
import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext'; // Anpassad för Firebase Auth
import { useRouter } from 'next/navigation';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
);

export default function Header() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Omdirigering hanteras nu av `useEffect` i page.tsx och AuthGuard
    } catch (error) {
      console.error("Inloggningsfel", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/'); // Säkerställ omdirigering till startsidan
    } catch (error) {
      console.error("Utloggningsfel", error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} />
          <span className="text-2xl font-bold text-white">ByggPilot</span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4">
          {loading ? (
            <div className="h-8 w-24 bg-gray-700 rounded-md animate-pulse"></div>
          ) : user ? (
            <div className="relative group">
              <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-600 cursor-pointer">
                  {user.photoURL ? (
                      <Image 
                      src={user.photoURL} 
                      alt="Profilbild" 
                      width={40} 
                      height={40} 
                      className="rounded-full" 
                      />
                  ) : (
                      getInitials(user.displayName)
                  )}
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <a onClick={() => router.push('/dashboard')} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Dashboard</a>
                  <button 
                      onClick={handleSignOut} 
                      className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                  >
                      Logga ut
                  </button>
              </div>
           </div>
          ) : (
            <button onClick={handleSignIn} className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-2 px-3 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-300">
              <GoogleIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Logga in med Google</span>
              <span className="sm:hidden text-sm">Logga in</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
