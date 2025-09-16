'use client';
import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext'; // <-- BYTT TILL VÅR NYA AUTH CONTEXT
import { IconDashboard, IconProjects, IconDocuments, IconCustomers, IconPlus, IconSettings, IconClock, IconLogout } from '@/app/constants';
import { View } from '@/app/dashboard/page';
import { useRouter } from 'next/navigation'; // Importera useRouter

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-cyan-500 text-white shadow-md'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

interface SidebarProps {
    activeView: View;
    onNavClick: (view: View) => void;
    onStartQuoteFlow: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavClick, onStartQuoteFlow }) => {
  const { user, loading, logout } = useAuth(); // <-- ANVÄNDER VÅR NYA HOOK
  const router = useRouter();

  // Ny utloggningsfunktion som använder AuthContext
  const handleLogout = async () => {
    await logout();
    router.push('/'); // Omdirigera till startsidan efter utloggning
  };

  if (loading) {
    return (
        <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
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
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-700 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
         <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
         <h1 className="text-2xl font-bold ml-2">ByggPilot</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem icon={<IconDashboard className="w-6 h-6" />} label="Översikt" active={activeView === 'DASHBOARD'} onClick={() => onNavClick('DASHBOARD')} />
        <NavItem icon={<IconProjects className="w-6 h-6" />} label="Projekt" active={activeView === 'PROJECTS'} onClick={() => onNavClick('PROJECTS')} />
        <NavItem icon={<IconClock className="w-6 h-6" />} label="Tidrapportering" active={activeView === 'TIME_REPORTING'} onClick={() => onNavClick('TIME_REPORTING')} />
        <NavItem icon={<IconDocuments className="w-6 h-6" />} label="Dokument" active={activeView === 'DOCUMENTS'} onClick={() => onNavClick('DOCUMENTS')} />
        <NavItem icon={<IconCustomers className="w-6 h-6" />} label="Kunder" active={activeView === 'CUSTOMERS'} onClick={() => onNavClick('CUSTOMERS')} />
      </nav>
      
      <div className="px-4 py-4">
        <button 
            onClick={onStartQuoteFlow}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
          <IconPlus className="w-5 h-5" />
          <span>Skapa Offert</span>
        </button>
      </div>
      
      <div className="border-t border-gray-700 mt-auto p-4 space-y-4">
         {/* Här kan du lägga till logik som visar användarens namn/email från `user`-objektet om du vill */}
         {user && (
             <div className="text-sm text-gray-400 truncate">
                 Inloggad som {user.displayName || user.email}
             </div>
         )}
         <NavItem icon={<IconSettings className="w-6 h-6" />} label="Inställningar" active={activeView === 'SETTINGS'} onClick={() => onNavClick('SETTINGS')} />
         <NavItem icon={<IconLogout className="w-6 h-6" />} label="Logga ut" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Sidebar;
