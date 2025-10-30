
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useUI } from '../../contexts/UIContext';

const Header: React.FC = () => {
    const { toggleSidebar } = useUI();

    return (
        <header className="flex-shrink-0 bg-background-secondary h-16 flex items-center justify-between px-6 border-b border-border-color z-30 shadow-sm">
            {/* Vänster sektion: Logotyp och Hamburgermeny */}
            <div className="flex items-center gap-4">
                {/* Hamburgermeny (endast mobil) */}
                <button 
                    onClick={toggleSidebar} 
                    className="p-1 text-text-secondary hover:text-text-primary lg:hidden"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Logotyp (endast desktop) */}
                <Link href="/dashboard" className="hidden lg:flex items-center gap-3">
                    <Image src="/images/byggpilot-icon.png" alt="ByggPilot Ikon" width={32} height={32} />
                    <span className="font-bold text-xl text-text-primary">ByggPilot</span>
                 </Link>
            </div>

            {/* Höger sektion: Sök, Notifikationer */}
            <div className="flex items-center gap-5">
                {/* Sökfält */}
                <div className="relative w-full max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-lg leading-5 bg-background-primary text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        placeholder="Sök..."
                        type="search"
                    />
                </div>

                {/* Notifikationsklocka */}
                <button className="p-2 rounded-full text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors">
                    <BellIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;
