
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { MagnifyingGlassIcon, BellIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import SearchResults from '@/app/components/layout/SearchResults';

interface HeaderProps {
  onChatToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChatToggle }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

          {session?.user && (
            <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-600">
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
