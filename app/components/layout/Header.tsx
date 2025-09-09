
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

// Denna komponent hanterar in/utloggning och visar användarinformation.
const AuthButton = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>;
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
      <button onClick={() => signIn('google')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Logga in med Google
      </button>
  );
};

const Header = () => {
  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
            <Image src="/images/byggpilot.png" alt="ByggPilot 2.0 Logotyp" width={40} height={40} />
            <span className="ml-2 text-lg font-semibold">ByggPilot 2.0</span>
        </div>
        
        <div className="flex items-center gap-6">
            <AuthButton />
        </div>
    </header>
  );
};

export default Header;
