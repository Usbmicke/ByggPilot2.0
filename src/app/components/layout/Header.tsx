'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react'; // NYTT: Byt till Lucide-ikoner
import { useSession } from 'next-auth/react';

const Header: React.FC = () => {
    const { data: session } = useSession();

    return (
        <header className="flex-shrink-0 h-20 flex items-center justify-between px-6 z-30">

            {/* ---- SÖKFÄLT (Vänster/Center) ---- */}
            <div className="relative w-full max-w-lg">
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
                    placeholder="Sök efter projekt, kunder, dokument..."
                    type="search"
                />
            </div>

            {/* ---- HÖGER SEKTION: Notifikationer & Användarprofil ---- */}
            <div className="flex items-center gap-6">
                <button className="p-2 rounded-full text-text-secondary hover:text-text-primary transition-colors">
                    <Bell className="h-6 w-6" />
                </button>

                {/* Användaravatar med ny, ren stil */}
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
