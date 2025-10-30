
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import UserMenu from '@/components/layout/UserMenu'; 
import Clock from '@/components/layout/Clock'; 
import { useModal } from '@/contexts/ModalContext';

interface HeaderProps {
    // Inga props behövs längre då UI-state hanteras av context
}

const Header: React.FC<HeaderProps> = () => {
    const { data: session } = useSession();
    const { openModal } = useModal();

    const handleCreateNew = () => {
        openModal('createOffer'); // Exempel: Öppnar en modal för att skapa offert
    };

    return (
        <header className="bg-background-secondary p-4 flex items-center justify-between border-b border-border-color">
            <div className="flex items-center">
                {/* <button 
                    onClick={toggleSidebar} 
                    className="md:hidden mr-4 p-2 rounded-md hover:bg-background-tertiary"
                >
                    <Bars3Icon className="h-6 w-6 text-text-primary" />
                </button> */}
                <h1 className="text-xl font-semibold text-text-primary">Översikt</h1>
            </div>
            <div className="flex items-center space-x-4">
                <Clock />
                <button onClick={() => alert('Notifikationer kommer snart!')} className="p-2 rounded-full hover:bg-background-tertiary">
                    <BellIcon className="h-6 w-6 text-text-primary" />
                </button>
                {session?.user && <UserMenu user={session.user} />}
            </div>
        </header>
    );
};

export default Header;
