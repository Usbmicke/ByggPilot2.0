
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import UserMenu from '@/app/components/layout/UserMenu'; 
import Clock from '@/app/components/layout/Clock'; 
import { useModal } from '@/app/contexts/ModalContext';

interface HeaderProps {
  onMenuClick: () => void; // Funktion för att öppna sidomenyn på mobilen
}

/**
 * Header har uppdaterats för att vara en ren klientkomponent.
 * Den konsumerar nu session-data direkt via useSession-hooken från NextAuth.
 * Detta simplifierar datan-flödet och gör komponenten mer självförsörjande.
 * UserMenu-komponenten har brutits ut för att hantera all logik kring användarmenyn.
 */
export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-[65px] px-4 md:px-6 bg-background-secondary border-b border-border-primary z-10">
      {/* Vänster sida: Hamburgermeny för mobil & sökfält (framtida) */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-text-secondary hover:text-text-primary">
          <Bars3Icon className="h-6 w-6" />
        </button>
        {/* Framtida plats för globalt sökfält */}
      </div>

      {/* Höger sida: Klocka, Notiser & Användarmeny */}
      <div className="flex items-center gap-4">
        <Clock />
        
        <button className="relative p-2 text-text-secondary hover:text-text-primary">
          <BellIcon className="h-6 w-6" />
          {/* Badge för notiser (framtida) */}
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-status-danger ring-2 ring-background-secondary" />
        </button>
        
        {session?.user && <UserMenu user={session.user} />}
      </div>
    </header>
  );
};

