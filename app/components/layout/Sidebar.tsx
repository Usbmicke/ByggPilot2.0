
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

// Importera centraliserad data och den nya komponenten
import { primaryNavigation } from '@/app/constants/navigation';
import SidebarUserProfile from '@/app/components/layout/SidebarUserProfile';
import Popover from '@/app/components/shared/Popover'; // Behölls för framtida bruk
import { useUI } from '@/app/contexts/UIContext'; // Importera UI-kontexten

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar-komponenten har refaktorerats för att agera som en ren layout-container.
 * Navigationsdatan importeras från en centraliserad konstantfil och
 * användarprofilen renderas av en dedikerad underkomponent.
 * KNAPPEN '+ Skapa Offert' har bytts ut mot '+ Skapa Nytt' enligt Kungstandard.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openModal } = useUI(); // Hämta funktionen för att öppna modalen

  // Denna funktion kommer att öppna den nya "Skapa Nytt"-dialogen.
  // För nuvarande öppnar den en placeholder.
  const handleCreateNew = () => {
    // NÄR MODALEN FINNS: openModal('CREATE_NEW_MODAL');
    alert('Funktion för att skapa Nytt [Projekt], [Offert], [Kund] kommer snart!');
  };

  return (
    <>
      {/* Overlay för mobilvy */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidofälts-container */}
      <aside className={`fixed top-0 left-0 w-64 h-full bg-background-secondary z-40 transform transition-transform duration-300 ease-in-out \
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex md:flex-col md:border-r md:border-border-primary`}>
        
        {/* Header för sidofältet */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary h-[65px]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
            <span className="font-bold text-xl text-text-primary">ByggPilot</span>
          </Link>
           <button onClick={onClose} className="md:hidden p-1 text-text-secondary hover:text-text-primary">
             <ChevronLeftIcon className="h-6 w-6" />
           </button>
        </div>
        
        {/* Navigationssektion */}
        <div className="flex flex-col flex-1 p-4">
          <nav className="flex-1">
            <ul>
              {primaryNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.name} id={item.id}>
                    <Link href={item.href} className={`flex items-center gap-3 px-4 py-2.5 my-1 rounded-lg transition-colors duration-200 \
                        ${isActive 
                          ? 'bg-accent-blue text-white shadow-sm' 
                          : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}`}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA-knapp enligt Kungstandard */}
          <div className="py-4">
              <button 
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-3 rounded-lg hover:bg-accent-blue-dark transition-colors duration-200 shadow">
                  <PlusIcon className="h-5 w-5" />
                  <span>Skapa Nytt</span>
              </button>
          </div>
        </div>

        {/* Användarprofilsektion */}
        <div className="p-4 border-t border-border-primary">
          {session?.user && <SidebarUserProfile user={session.user} />}
        </div>
      </aside>
    </>
  );
};

