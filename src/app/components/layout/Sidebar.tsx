
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { PlusIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

import { primaryNavigation } from '../../constants/navigation';
import SidebarUserProfile from './SidebarUserProfile';
import { useModal } from '../../contexts/ModalContext';

// Denna komponent är nu en ren presentationskomponent.
// All logik för bredd och positionering hanteras av dess förälder (DashboardLayout.tsx).

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openModal } = useModal();

  return (
    <div className="h-full bg-background-secondary text-text-primary flex flex-col p-4 border-r border-border-color">
      
      {/* ---- TOP SECTION: Navigation Links ---- */}
      <nav className="flex-1 space-y-1.5">
        {primaryNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium 
                        ${pathname.startsWith(item.href)
                          ? 'bg-gray-800 text-white' // Mörkare bakgrund för aktiv länk
                          : 'text-text-secondary hover:bg-gray-800/60 hover:text-text-primary'}`}>
            <item.icon className={`h-6 w-6 transition-colors ${pathname.startsWith(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* ---- MIDDLE SECTION: Create New Button ---- */}
      <div className="my-4">
        <button 
          onClick={() => openModal('createProject')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 border-dashed border-gray-600 text-text-secondary font-medium hover:bg-gray-800/60 hover:text-text-primary hover:border-solid hover:border-gray-500 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Skapa Nytt</span>
        </button>
      </div>

      {/* ---- BOTTOM SECTION: Profile, Settings, Logout ---- */}
      {/* mt-auto tvingar denna sektion till botten av flex-containern */}
      <div className="mt-auto">
        <div className="border-t border-border-color pt-4 space-y-2">
          {session?.user && <SidebarUserProfile user={session.user} />}

          <Link href="/dashboard/settings" className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-text-secondary hover:bg-gray-800/60 hover:text-text-primary`}>
              <Cog6ToothIcon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
              <span>Inställningar</span>
          </Link>

          <button onClick={() => signOut({ callbackUrl: '/' })} className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-text-secondary hover:bg-gray-800/60 hover:text-text-primary`}>
              <ArrowLeftOnRectangleIcon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
              <span>Logga ut</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
