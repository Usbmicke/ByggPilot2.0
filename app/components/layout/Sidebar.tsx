
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HomeIcon, 
  FolderIcon, 
  UsersIcon, 
  CogIcon, 
  ArchiveBoxIcon, 
  ChevronLeftIcon, 
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projekt', href: '/projects', icon: FolderIcon },
  { name: 'Kunder', href: '/customers', icon: UsersIcon },
  { name: 'Arkiv', href: '/archive', icon: ArchiveBoxIcon },
  { name: 'Inställningar', href: '/settings', icon: CogIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`fixed top-0 left-0 w-64 h-full bg-background-secondary z-40 transform transition-transform duration-300 ease-in-out \
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex md:flex-col md:border-r md:border-border-primary`}>
        
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
            <span className="font-bold text-xl text-text-primary">ByggPilot</span>
          </Link>
           <button onClick={onClose} className="md:hidden p-1 text-text-secondary hover:text-text-primary">
             <ChevronLeftIcon className="h-6 w-6" />
           </button>
        </div>

        {/* Navigationslänkar - tar upp resterande utrymme */}
        <nav className="flex-1 p-4">
          <ul>
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link href={item.href} legacyBehavior>
                    <a className={`flex items-center gap-3 px-4 py-2.5 my-1 rounded-lg transition-colors duration-200 \
                      ${isActive 
                        ? 'bg-accent-blue text-white shadow-sm' 
                        : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}`}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Användarinfo och Logga ut - längst ner */}
        <div className="p-4 border-t border-border-primary">
          {session && session.user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="Profilbild" width={40} height={40} className="rounded-full" />
                  ) : (
                    getInitials(session.user.name)
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary truncate">{session.user.name}</p>
                </div>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-text-secondary hover:text-status-danger rounded-md transition-colors"
                title="Logga ut"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
