'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 left-64 right-0 h-20 bg-gray-800 border-b border-gray-700 flex items-center justify-end px-8">
            {user && (
                <div className="flex items-center">
                    <span className="text-gray-300 mr-4">{user.email}</span>
                    <button 
                        onClick={logout} 
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Logga ut
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
