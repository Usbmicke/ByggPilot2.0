
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// Denna komponent hanterar in/utloggning och visar användarinformation.
const AuthButton = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>; // Enkel laddningsindikator
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {session.user?.name || session.user?.email}
        </span>
        <button onClick={() => signOut()} className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Logga ut
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })} 
      className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-150 ease-in-out shadow-md"
    >
      Logga in med Google
    </button>
  );
};

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
           <a href="/dashboard" className="flex items-center gap-2">
             <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} className="h-8 w-8"/>
             <span className="text-lg font-bold text-gray-900">ByggPilot</span>
           </a>
        </div>

        <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
          <div className="w-full max-w-lg lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Sök</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input 
                id="search"
                name="search"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-cyan-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm"
                placeholder="Sök projekt eller kunder"
                type="search" 
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center">
          <AuthButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
