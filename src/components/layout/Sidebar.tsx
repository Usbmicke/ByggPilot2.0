'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Plus, Settings, LogOut } from 'lucide-react';

import { primaryNavigation } from '@/constants/navigation';
import SidebarUserProfile from './SidebarUserProfile';
// import { useModal } from '@/contexts/ModalContext'; // BORTTAGEN: Modal-systemet byggs om.

// VERSION 1.1: Logotypen är borttagen härifrån och har flyttats till Header.tsx
const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  // const { openModal } = useModal(); // BORTTAGEN: Modal-systemet byggs om.

  return (
    // Tar bort den övre `h-16`-sektionen för loggan.
    <div className="h-full bg-background-secondary text-text-primary flex flex-col p-4 border-r border-border-color">
      
      {/* ---- HUVUDNAVIGERING ---- */}
      {/* `mt-4` tillagt för att ge lite luft uppåt efter att loggan togs bort */}
      <nav className="flex-1 space-y-2 mt-4">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium 
                          ${isActive
                            ? 'text-primary' // ELEGANT: Endast text & ikon blir cyan
                            : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}`}>
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* ---- SKAPA NYTT-KNAPP (Inaktiverad) ---- */}
      <div className="my-4">
        <button 
          // onClick={() => openModal('createOptions')} // BORTTAGEN: Funktionalitet inaktiverad under ombyggnad.
          disabled={true} // Inaktiverar knappen
          className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-lg border border-border-color text-text-secondary font-semibold transition-all duration-200 cursor-not-allowed opacity-50"
        >
          <Plus className="h-5 w-5" />
          <span>Skapa Nytt</span>
        </button>
      </div>

      {/* ---- BOTTENSEKTION: Profil, Inställningar, Logga ut ---- */}
      <div className="mt-auto">
        <div className="border-t border-border-color pt-4 space-y-1">
          {session?.user && <SidebarUserProfile user={session.user} />}

          <Link href="/dashboard/settings" className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-text-secondary hover:bg-background-tertiary hover:text-text-primary`}>
              <Settings className="h-5 w-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              <span>Inställningar</span>
          </Link>

          <button onClick={() => signOut({ callbackUrl: '/' })} className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-text-secondary hover:bg-background-tertiary hover:text-text-primary`}>
              <LogOut className="h-5 w-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              <span>Logga ut</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
