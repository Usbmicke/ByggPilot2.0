'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react'; // Byt till next-auth
import Image from 'next/image';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import SearchResults from '@/app/components/layout/SearchResults';

const Header: React.FC = () => {
  const { data: session } = useSession(); // Använd session från next-auth
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // Använd signOut från next-auth
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="fixed top-0 left-64 right-0 bg-gray-900 border-b border-gray-700/50 p-4 z-30">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input 
            type="search" 
            placeholder="Sök efter projekt, kunder, dokument..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors" 
          />
          {isSearchFocused && searchQuery && (
            <SearchResults query={searchQuery} />
          )}
        </div>

        <div className="flex items-center gap-4 ml-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            onClick={() => alert('Notisfunktionen är under utveckling!')}
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {session?.user && (
             <div className="relative group">
                <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-600 cursor-pointer">
                    {session.user.image ? (
                        <Image 
                        src={session.user.image} 
                        alt="Profilbild" 
                        width={40} 
                        height={40} 
                        className="rounded-full" 
                        />
                    ) : (
                        getInitials(session.user.name)
                    )}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                    >
                        Logga ut
                    </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
