'use client';
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { IconSearch, IconBell } from '@/app/constants';
import { Notification } from '@/app/types';
import SearchResults from './SearchResults';

interface HeaderProps {
    notifications: Notification[];
    isNotificationsOpen: boolean;
    onNotificationsToggle: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: any[];
    onCloseSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({
    notifications,
    isNotificationsOpen,
    onNotificationsToggle,
    searchTerm,
    onSearchChange,
    searchResults,
    onCloseSearch,
}) => {
    const { user } = useAuth();
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                if (isNotificationsOpen) onNotificationsToggle();
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                onCloseSearch();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotificationsOpen, onNotificationsToggle, onCloseSearch]);


  return (
    <header className="flex items-center justify-between h-20 px-8 bg-gray-800/30 backdrop-blur-sm border-b border-gray-700 flex-shrink-0">
      <div>
        <h1 className="text-xl font-bold text-white">God morgon, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-sm text-gray-400">Här är en översikt av dina projekt idag.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md" ref={searchRef}>
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <IconSearch className="w-5 h-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Sök efter projekt, filer eller kunder..."
            className="w-full py-2 pl-10 pr-4 text-gray-300 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm.length > 1 && <SearchResults results={searchResults} />}
        </div>
        <div className="relative" ref={notificationsRef}>
            <button onClick={onNotificationsToggle} className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50">
                <IconBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-cyan-500 ring-2 ring-gray-800 animate-pulse" />
                )}
            </button>
            {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                    <div className="p-3 border-b border-gray-700">
                        <h4 className="font-semibold text-white">Notifieringar</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`p-3 text-sm border-b border-gray-800 ${n.read ? 'text-gray-500' : 'text-gray-200'}`}>
                                    {n.text}
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">Inga nya notifieringar.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;