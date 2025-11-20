
'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import UserMenu from './UserMenu'; // Antagande att UserMenu-komponenten existerar

export default function DashboardHeader() {
  return (
    <header className="flex h-20 flex-shrink-0 items-center justify-between px-6 md:px-8 bg-[#1C1C1E] border-b border-neutral-800/50">
      {/* Sökfält */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Sök efter projekt, kunder, dokument..."
          className="w-full bg-[#111113] border border-neutral-700/70 rounded-lg text-neutral-200 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-neutral-500"
        />
      </div>

      {/* Ikoner och Användarmeny */}
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
};
