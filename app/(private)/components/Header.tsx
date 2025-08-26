'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Stänger dropdown-menyn om man klickar utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    // Omdirigering hanteras av AuthGuard
  };

  return (
    <header className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
      {/* Logotyp */}
      <div className="flex items-center space-x-2">
        <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
        <span className="text-xl font-bold text-white hidden sm:block">ByggPilot</span>
      </div>

      {/* Användarmeny */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <span className="text-white mr-4 hidden sm:block">{user?.displayName || 'Användare'}</span>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Användarbild"
              className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-cyan-400 transition-colors"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-cyan-500 hover:text-white transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logga ut</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
