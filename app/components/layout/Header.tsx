'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import SearchResults from '@/app/components/layout/SearchResults';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-gray-900 border-b border-gray-800 p-4 z-30">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xl hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input 
            type="search" 
            placeholder="Sök efter projekt, kunder, dokument..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200" 
          />
          {isSearchFocused && searchQuery && (
            <SearchResults query={searchQuery} />
          )}
        </div>

        <div className="md:hidden">
            <span className="text-xl font-bold text-white">ByggPilot</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-700/60 transition-colors text-gray-400 hover:text-white"
            onClick={() => alert('Notisfunktionen är under utveckling!')}
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {session && session.user && (
             <div className="relative group">
                <div className="h-10 w-10 rounded-full bg-cyan-700 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-700 cursor-pointer overflow-hidden">
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
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1.5 z-50 hidden group-hover:block transition-all duration-300 origin-top-right animate-in fade-in-0 zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-semibold text-white truncate">{session.user.name || "Användare"}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 mt-1"
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

