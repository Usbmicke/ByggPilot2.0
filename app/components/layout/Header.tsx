
'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MagnifyingGlassIcon, 
  BellIcon, 
  Bars3Icon, 
  CogIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import SearchResults from '@/app/components/layout/SearchResults';
import Clock from '@/app/components/layout/Clock';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Funktion för att stänga sökresultaten och rensa sökfältet
  const handleSearchResultClick = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-background-secondary border-b border-border-primary p-4 z-20">
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden text-text-secondary hover:text-text-primary"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-lg hidden md:block">
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
              <SearchResults query={searchQuery} onResultClick={handleSearchResultClick} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Clock />

          <button 
            className="p-2 rounded-full hover:bg-border-primary transition-colors text-text-secondary hover:text-text-primary relative group"
            onClick={() => alert('Simulerad notis: Ett nytt ÄTA-förslag har inkommit för Projekt X.')}
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red"></span>
            </span>
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
                
                <div className="absolute right-0 w-56 bg-background-secondary border border-border-primary rounded-md shadow-lg z-50 hidden group-hover:block transition-all duration-300 origin-top-right animate-in fade-in-0 zoom-in-95 pt-2">
                    <div className="px-4 py-3 border-b border-border-primary">
                      <p className="text-sm font-semibold text-text-primary truncate">{session.user.name || "Användare"}</p>
                      <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
                    </div>
                    <div className="py-1.5">
                        <Link href="/settings" legacyBehavior>
                            <a className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary">
                                <CogIcon className="h-5 w-5" />
                                Inställningar
                            </a>
                        </Link>
                        <button
                            onClick={() => alert("Profilsidan är under utveckling")}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                        >
                            <UserCircleIcon className="h-5 w-5" />
                            Min Profil
                        </button>
                    </div>
                    <div className="py-1.5 border-t border-border-primary">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-status-danger hover:bg-status-danger/20"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Logga ut
                        </button>
                    </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
