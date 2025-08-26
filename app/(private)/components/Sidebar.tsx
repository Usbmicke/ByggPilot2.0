'use client';

import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-800 p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-10">ByggPilot 2.0</h1>
      <nav className="flex-1">
        <ul>
          <li className="mb-4">
            <a href="/dashboard" className="text-lg text-gray-300 hover:text-white">Dashboard</a>
          </li>
          {/* Fler länkar kan läggas till här */}
        </ul>
      </nav>
      <button 
        onClick={logout}
        className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Logga ut
      </button>
    </aside>
  );
}
