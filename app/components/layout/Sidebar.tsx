
'use client';
import React from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { IconDashboard, IconProjects, IconDocuments, IconCustomers, IconPlus, IconSettings, IconLightbulb, IconClock } from '@/app/constants'; // Assuming constants.tsx is in the app root
import { View } from '@/app/dashboard/page';

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
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Handle loading and unauthenticated states
  if (status === 'loading') {
    return (
        <div className="flex flex-col w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 text-white">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <h1 className="text-2xl font-bold">Laddar...</h1>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 text-white">
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
      <div className="px-4 py-4 space-y-4">
        <button 
            onClick={onStartQuoteFlow}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
          <IconPlus className="w-5 h-5" />
          <span>Skapa Offert</span>
        </button>
      </div>
      <div className="border-t border-gray-700 p-4">
         <NavItem icon={<IconSettings className="w-6 h-6" />} label="Inställningar" active={activeView === 'SETTINGS'} onClick={() => onNavClick('SETTINGS')} />
        {status === 'authenticated' && session.user && (
            <div className="flex items-center mt-4">
            {session.user.image && <Image className="h-10 w-10 rounded-full object-cover" src={session.user.image} alt="User avatar" width={40} height={40}/>}
            <div className="ml-3">
                <p className="text-sm font-semibold text-white">{session.user.name || 'Användare'}</p>
                <p className="text-xs text-gray-400">{session.user.email || 'Ingen email'}</p>
            </div>
            </div>
        )}
        <button onClick={handleLogout} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white transition-colors duration-200 pl-1">
          Logga ut
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
