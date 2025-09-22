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
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-background-secondary border-b border-border-primary p-4 z-30">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xl hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input 
            type="search" 
            placeholder="Sök efter projekt, kunder, dokument..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-background-primary border border-border-primary text-text-primary rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-200" 
          />
          {isSearchFocused && searchQuery && (
            <SearchResults query={searchQuery} />
          )}
        </div>

        <div className="md:hidden">
            <span className="text-xl font-bold text-text-primary">ByggPilot</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4">
          <button 
            className="p-2 rounded-full hover:bg-border-primary transition-colors text-text-secondary hover:text-text-primary"
            onClick={() => alert('Notisfunktionen är under utveckling!')}
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {session && session.user && (
             <div className="relative group">
                <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm border-2 border-border-primary cursor-pointer overflow-hidden">
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
                <div className="absolute right-0 mt-2 w-56 bg-background-secondary border border-border-primary rounded-md shadow-lg py-1.5 z-50 hidden group-hover:block transition-all duration-300 origin-top-right animate-in fade-in-0 zoom-in-95">
                    <div className="px-4 py-2 border-b border-border-primary">
                      <p className="text-sm font-semibold text-text-primary truncate">{session.user.name || "Användare"}</p>
                      <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-left block px-4 py-2 text-sm text-status-danger hover:bg-status-danger/20 mt-1"
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
