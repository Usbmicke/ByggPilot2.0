'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; // KORRIGERING: Importerar useAuth
import { signOut } from 'firebase/auth';                 // KORRIGERING: Importerar signOut från Firebase
import { auth } from '@/app/lib/firebase/client';   // KORRIGERING: Importerar auth-instansen
import { IconDashboard, IconProjects, IconDocuments, IconCustomers, IconPlus, IconSettings, IconClock, IconLogout } from '@/app/constants';

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
  const { user, loading } = useAuth(); // KORRIGERING: Använder useAuth istället för useSession
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // KORRIGERING: Använder Firebase signOut
      router.push('/'); // Omdirigera till landningssidan efter utloggning
    } catch (error) {
      console.error("Fel vid utloggning: ", error);
    }
  };

  // Visar en laddnings-skeleton medan användardata hämtas
  if (loading) {
    return (
      <aside className="flex flex-col w-64 bg-gray-900 border-r border-gray-700 p-4 fixed h-full z-30">
          <div className="animate-pulse">
              <div className="h-10 bg-gray-700 rounded mb-10"></div>
              <div className="space-y-4">
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
              </div>
              <div className="mt-auto pt-10">
                  <div className="h-12 bg-gray-700 rounded mb-6"></div>
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded"></div>
                          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                      </div>
                  </div>
              </div>
          </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-64 bg-gray-900 border-r border-gray-700 text-white fixed h-full z-30">
      <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0">
         <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
         <h1 className="text-2xl font-bold ml-2">ByggPilot</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem href="/dashboard" icon={<IconDashboard className="w-6 h-6" />} label="Översikt" />
        <NavItem href="/projects" icon={<IconProjects className="w-6 h-6" />} label="Projekt" />
        <NavItem href="/time-reporting" icon={<IconClock className="w-6 h-6" />} label="Tidrapportering" />
        <NavItem href="/documents" icon={<IconDocuments className="w-6 h-6" />} label="Dokument" />
        <NavItem href="/customers" icon={<IconCustomers className="w-6 h-6" />} label="Kunder" />
      </nav>
      
      <div className="px-4 py-4 mt-auto border-t border-gray-700 flex-shrink-0">
        <button 
            onClick={() => alert('Funktionen \'Skapa Offert\' är under utveckling!')}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
          <IconPlus className="w-5 h-5" />
          <span>Skapa Offert</span>
        </button>
      </div>
      
      <div className="border-t border-gray-700 p-4 flex-shrink-0">
        {user && ( // KORRIGERING: Använder Firebase 'user'-objekt
            <div className="flex items-center gap-3 mb-4">
                <Image 
                    src={user.photoURL || './images/default-profile.png'} // KORRIGERING: user.photoURL
                    alt="Profilbild"
                    width={40} 
                    height={40} 
                    className="rounded-full bg-gray-600"
                />
                <div className="truncate">
                    <p className="font-semibold text-white text-sm">{user.displayName || 'Användare'}</p> {/* KORRIGERING: user.displayName */}
                    <p className="text-gray-400 text-xs truncate">{user.email}</p> {/* KORRIGERING: user.email */}
                </div>
            </div>
        )}
        <NavItem href="/settings" icon={<IconSettings className="w-6 h-6" />} label="Inställningar" />
        <button 
          onClick={handleSignOut} // KORRIGERING: Anropar den nya utloggningsfunktionen
          className="flex items-center w-full px-4 py-2.5 mt-2 rounded-lg transition-colors duration-200 text-left text-gray-400 hover:bg-red-800/50 hover:text-white">
          <IconLogout className="w-6 h-6" />
          <span className="ml-4 font-medium">Logga ut</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
