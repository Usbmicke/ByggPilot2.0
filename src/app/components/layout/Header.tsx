'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

// =================================================================================
// HEADER V2.1 - Korrigerad Logotyp
// =================================================================================
// Denna version korrigerar sökvägen till logotypen från en .svg som inte existerade
// till den korrekta .png-filen som finns i /public/images.

const Header: React.FC = () => {
    const { data: session } = useSession();

    return (
        <header className="flex-shrink-0 bg-background-secondary h-16 flex items-center justify-between border-b border-border-color z-30">
            
            {/* ---- Kombinerad Vänster & Center Sektion ---- */}
            <div className="flex items-center flex-1">

                {/* ---- Vänster Sektion: Logotyp (fast bredd) ---- */}
                <div className="w-72 flex-shrink-0 flex items-center justify-center">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={28} height={28} />
                        <span className="font-bold text-xl text-text-primary hidden sm:inline">ByggPilot</span>
                    </Link>
                </div>

                {/* ---- Center Sektion: Sökfält (vänsterjusterad) ---- */}
                <div className="relative w-full max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full pl-11 pr-4 py-2.5 border border-transparent rounded-lg bg-background-primary text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-background-secondary transition-all"
                        placeholder="Sök efter projekt, kunder, dokument..."
                        type="search"
                    />
                </div>
            </div>

            {/* ---- Höger Sektion: Notifikationer & Användarprofil ---- */}
            <div className="flex items-center gap-5 px-6">
                <button className="p-2 rounded-full text-text-secondary hover:bg-gray-800/60 hover:text-text-primary transition-colors">
                    <BellIcon className="h-6 w-6" />
                </button>

                {/* Användaravatar */}
                {session?.user?.image && (
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700">
                         <Image 
                            src={session.user.image} 
                            alt={session.user.name || 'Användarbild'} 
                            width={36} 
                            height={36} 
                            className="object-cover"
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
