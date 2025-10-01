
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Bars3Icon } from '@heroicons/react/24/outline';

// Importera de nya, dekonstruerade komponenterna
import GlobalSearchBar from '@/app/components/layout/GlobalSearchBar';
import NotificationBell from '@/app/components/layout/NotificationBell';
import UserMenu from '@/app/components/layout/UserMenu';
import Clock from '@/app/components/layout/Clock';

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header-komponenten fungerar nu som en ren layout-container.
 * Dess enda ansvar är att arrangera de specialiserade komponenterna 
 * som utgör headerns funktionalitet.
 * All komplex logik och tillståndshantering har flyttats till sina
 * respektive underkomponenter.
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-background-secondary border-b border-border-primary p-4 z-20">
      <div className="flex items-center justify-between">
        
        {/* Vänstra Sektionen: Hamburgermeny och Sökfält */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden text-text-secondary hover:text-text-primary"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="hidden md:block w-full max-w-lg">
            <GlobalSearchBar />
          </div>
        </div>

        {/* Högra Sektionen: Klocka, Notiser och Användarmeny */}
        <div className="flex items-center gap-2 md:gap-4">
          <Clock />
          <NotificationBell />
          {session?.user && <UserMenu user={session.user} />}
        </div>

      </div>
    </header>
  );
};

export default Header;
