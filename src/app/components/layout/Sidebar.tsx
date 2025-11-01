'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Plus, Settings, LogOut } from 'lucide-react'; // NYTT: Byt till Lucide-ikoner för enhetlighet

import { primaryNavigation } from '../../constants/navigation';
import SidebarUserProfile from './SidebarUserProfile';
import { useModal } from '../../contexts/ModalContext';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openModal } = useModal();

  return (
    <div className="h-full bg-background-secondary text-text-primary flex flex-col p-4 border-r border-border-color">
      
      {/* ---- LOGO/VARUMÄRKE ---- */}
      <div className="h-16 flex items-center px-2 mb-4">
        {/* Ersätt med din riktiga logotyp-komponent här när den är klar */}
        <span className="text-2xl font-bold text-text-primary">ByggPilot</span>
      </div>

      {/* ---- HUVUDNAVIGERING ---- */}
      <nav className="flex-1 space-y-2">
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

      {/* ---- SKAPA NYTT-KNAPP (Ghost Button Stil) ---- */}
      <div className="my-4">
        <button 
          onClick={() => openModal('createOptions')}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-lg border border-border-color text-text-secondary font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
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
