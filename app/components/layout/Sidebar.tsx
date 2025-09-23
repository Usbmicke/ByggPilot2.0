'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Importera useRouter
import { useSession, signOut } from 'next-auth/react';
import { HomeIcon, FolderIcon, DocumentDuplicateIcon, UsersIcon, PlusIcon, Cog6ToothIcon, ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const NavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string; }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${
        isActive
          ? 'bg-accent-blue text-white shadow-md'
          : 'text-text-secondary hover:bg-border-primary hover:text-text-primary'
      }`}>
        {icon}
        <span className="ml-4 font-medium">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter(); // Initiera routern

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleCreateOfferClick = () => {
    router.push('/offer/new'); // Navigera till den nya sidan
  };

  if (status === 'loading') {
    return (
      <aside className="hidden md:flex flex-col w-64 bg-background-secondary border-r border-border-primary p-4 fixed h-full z-40">
          <div className="animate-pulse w-full">
              <div className="h-10 bg-border-primary rounded mb-10"></div>
              <div className="space-y-4">
                  <div className="h-8 bg-border-primary rounded"></div>
                  <div className="h-8 bg-border-primary rounded"></div>
                  <div className="h-8 bg-border-primary rounded"></div>
              </div>
              <div className="mt-auto pt-10 absolute bottom-4 left-4 right-4">
                  <div className="h-12 bg-border-primary rounded mb-6"></div>
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-border-primary rounded-full"></div>
                      <div className="flex-1 space-y-2">
                          <div className="h-4 bg-border-primary rounded"></div>
                          <div className="h-3 bg-border-primary rounded w-3/4"></div>
                      </div>
                  </div>
              </div>
          </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background-secondary border-r border-border-primary text-text-primary fixed h-full z-40">
      <div className="flex items-center justify-center h-20 flex-shrink-0 px-4">
        <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
        <h1 className="text-2xl font-bold ml-3">ByggPilot</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem href="/dashboard" icon={<HomeIcon className="w-6 h-6" />} label="Översikt" />
        <NavItem href="/projects" icon={<FolderIcon className="w-6 h-6" />} label="Projekt" />
        <NavItem href="/time-reporting" icon={<ClockIcon className="w-6 h-6" />} label="Tidrapportering" />
        <NavItem href="/documents" icon={<DocumentDuplicateIcon className="w-6 h-6" />} label="Dokument" />
        <NavItem href="/customers" icon={<UsersIcon className="w-6 h-6" />} label="Kunder" />
      </nav>
      
      <div className="px-4 py-4 mt-auto border-t border-border-primary flex-shrink-0">
        <button 
          onClick={handleCreateOfferClick} // Använd den nya hanteraren
          className="w-full flex items-center justify-center gap-2 bg-accent-blue hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/40">
          <PlusIcon className="w-5 h-5" />
          <span>Skapa Offert</span>
        </button>
      </div>
      
      <div className="border-t border-border-primary p-4 flex-shrink-0">
        {session && session.user && (
            <div className="flex items-center gap-3 mb-4">
                <Image 
                    src={session.user.image || './images/default-profile.png'}
                    alt="Profilbild"
                    width={40} 
                    height={40} 
                    className="rounded-full bg-border-primary"
                />
                <div className="truncate">
                    <p className="font-semibold text-text-primary text-sm">{session.user.name || 'Användare'}</p>
                    <p className="text-text-secondary text-xs truncate">{session.user.email}</p>
                </div>
            </div>
        )}
        <NavItem href="/settings" icon={<Cog6ToothIcon className="w-6 h-6" />} label="Inställningar" />
        <button 
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2.5 mt-2 rounded-lg transition-colors duration-200 text-left text-text-secondary hover:bg-status-danger/20 hover:text-status-danger">
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          <span className="ml-4 font-medium">Logga ut</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
