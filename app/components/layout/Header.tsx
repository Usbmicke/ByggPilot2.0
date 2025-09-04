'use client';
import React from 'react';
import { Notification } from '@/app/types';
import { IconBell, IconSearch, IconX } from '@/app/constants';
import SearchResults from './SearchResults';

interface HeaderProps {
    notifications: Notification[];
    isNotificationsOpen: boolean;
    onNotificationsToggle: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: { type: string; data: any }[];
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
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 md:px-8 border-b border-gray-700 relative z-20">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
                <div className="relative">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Sök efter projekt, dokument, kunder..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700/80 rounded-lg py-2.5 pl-12 pr-10 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                     {searchTerm && (
                        <button onClick={onCloseSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            <IconX className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {searchTerm.length > 1 && <SearchResults results={searchResults} onClose={onCloseSearch} />}
            </div>

            {/* Notifications Bell */}
            <div className="flex items-center gap-4 ml-4">
                <div className="relative">
                    <button onClick={onNotificationsToggle} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <IconBell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-30">
                            <div className="p-4 border-b border-gray-700">
                                <h3 className="font-bold text-white">Notifikationer</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n.id} className={`px-4 py-3 border-b border-gray-700/50 transition-opacity ${n.read ? 'opacity-50 hover:opacity-100' : ''}`}>
                                            <p className="text-sm text-gray-200">{n.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 p-4">Inga nya notifikationer.</p>
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
