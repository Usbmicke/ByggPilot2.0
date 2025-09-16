'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { IconDashboard, IconProjects, IconDocuments, IconCustomers, IconPlus, IconSettings, IconClock, IconLogout } from '@/app/constants'; // Lade till IconLogout

// NavItem - oförändrad
const NavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string; }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${
        isActive
          ? 'bg-cyan-500 text-white shadow-md'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}>
        {icon}
        <span className="ml-4 font-medium">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  // Hämta logout-funktionen från vår kontext.
  const { user, loading, logout } = useAuth();

  // Laddningsskeleton - oförändrad
  if (loading) {
    return (
      <div className="w-64 bg-gray-900 border-r border-gray-700 p-4 fixed h-full">
          <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-700 text-white fixed h-full z-30">
      {/* Header - oförändrad */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0">
         <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
         <h1 className="text-2xl font-bold ml-2">ByggPilot</h1>
      </div>
      
      {/* Navigation - oförändrad */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem href="/dashboard" icon={<IconDashboard className="w-6 h-6" />} label="Översikt" />
        <NavItem href="/projects" icon={<IconProjects className="w-6 h-6" />} label="Projekt" />
        <NavItem href="/time-reporting" icon={<IconClock className="w-6 h-6" />} label="Tidrapportering" />
        <NavItem href="/documents" icon={<IconDocuments className="w-6 h-6" />} label="Dokument" />
        <NavItem href="/customers" icon={<IconCustomers className="w-6 h-6" />} label="Kunder" />
      </nav>
      
      {/* Offertknapp - oförändrad */}
      <div className="px-4 py-4 mt-auto border-t border-gray-700 flex-shrink-0">
        <button 
            onClick={() => alert('Funktionen \'Skapa Offert\' är under utveckling!')}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
          <IconPlus className="w-5 h-5" />
          <span>Skapa Offert</span>
        </button>
      </div>
      
      {/* ==== NY, FÖRBÄTTRAD ANVÄNDARSEKTION & UTLOGGNINGSKNAPP ==== */}
      <div className="border-t border-gray-700 p-4 flex-shrink-0">
        {user && (
            <div className="flex items-center gap-3 mb-4">
                <Image 
                    src={user.photoURL || './images/default-profile.png'} 
                    alt="Profilbild"
                    width={40} 
                    height={40} 
                    className="rounded-full bg-gray-600"
                />
                <div className="truncate">
                    <p className="font-semibold text-white text-sm">{user.displayName || 'Användare'}</p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
            </div>
        )}
        <NavItem href="/settings" icon={<IconSettings className="w-6 h-6" />} label="Inställningar" />
        {/* Den nya, dedikerade utloggningsknappen */}
        <button 
          onClick={logout} 
          className="flex items-center w-full px-4 py-2.5 mt-2 rounded-lg transition-colors duration-200 text-left text-gray-400 hover:bg-red-800/50 hover:text-white">
          <IconLogout className="w-6 h-6" />
          <span className="ml-4 font-medium">Logga ut</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
