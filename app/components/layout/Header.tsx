'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // <-- BYTT TILL VÅR NYA AUTH CONTEXT
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MagnifyingGlassIcon, BellIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import SearchResults from '@/app/components/layout/SearchResults';

interface HeaderProps {
  onChatToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChatToggle }) => {
  const { user, loading, logout } = useAuth(); // <-- ANVÄNDER VÅR NYA HOOK
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // NOT: Låter setup-logiken vara kvar, men den kan behöva ses över.
  // Beroende på om /api/user/setup kräver en Firebase JWT eller en Next-Auth JWT.
  // Tills vidare är denna logik bortkommenterad för att undvika fel.
  /*
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  useEffect(() => {
    const setupUser = async () => {
      if (user && !isSetupRunning) { // Antag att vi behöver en property på user-objektet
        setIsSetupRunning(true);
        try {
          console.log('Starting user setup...');
          const response = await fetch('/api/user/setup', {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to run user setup');
          }
          console.log('User setup successful.');
          // Kanske uppdatera användarobjektet här?

        } catch (error) {
          console.error('Error during user setup:', error);
        } finally {
          setIsSetupRunning(false);
        }
      }
    };

    if (!loading && user) {
      setupUser();
    }
  }, [user, loading, isSetupRunning]);
  */

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700/50 p-4 sticky top-0 z-40">
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
          <button onClick={onChatToggle} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white">
            <BellIcon className="h-6 w-6" />
          </button>

          {user && (
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
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Kontoinställningar</a>
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
