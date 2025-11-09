'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

// ===================================================================================================
// HEADER RECONSTRUCTION V1.2 - FINAL LOGO
// ===================================================================================================
// 1. Byter ut platshållar-SVG:n mot den riktiga logotypen från /images/byggpilotlogga1.png

const Header: React.FC = () => {
    const { data: session } = useSession();

    return (
        <header className="flex-shrink-0 h-20 flex items-center justify-between px-6 z-30 border-b border-border-color">

            {/* ---- LOGOTYP (Vänster) ---- */}
            <div className="w-60 flex-shrink-0 flex items-center gap-3">
                {/* Byt ut platshållaren mot den riktiga logotypen */}
                <Image 
                    src="/images/byggpilotlogga1.png" // Sökväg från public-mappen
                    alt="ByggPilot Logotyp"
                    width={32} // w-8
                    height={32} // h-8
                    className="rounded-lg" // Behåller den avrundade stilen
                />
                <span className="text-xl font-bold text-text-primary">ByggPilot</span>
            </div>

            {/* ---- SÖKFÄLT (Mitten) ---- */}
            <div className="relative flex-1 max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                </div>
                <input
                    id="search"
                    name="search"
                    className={[
                        'block w-full pl-12 pr-4 py-3',
                        'bg-background-secondary border border-transparent rounded-lg',
                        'text-text-primary placeholder:text-text-secondary',
                        'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60',
                        'transition-all duration-200'
                    ].join(' ')}
                    placeholder="Sök..."
                    type="search"
                />
            </div>

            {/* ---- HÖGER SEKTION: Notifikationer & Användarprofil ---- */}
            <div className="w-60 flex-shrink-0 flex items-center justify-end gap-6">
                <button className="p-2 rounded-full text-text-secondary hover:text-text-primary transition-colors">
                    <Bell className="h-6 w-6" />
                </button>

                {session?.user?.image && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-background-tertiary ring-2 ring-border-color">
                         <Image 
                            src={session.user.image} 
                            alt={session.user.name || 'Användarbild'} 
                            width={40} 
                            height={40} 
                            className="object-cover"
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
