'use client';

import React, { useState, useEffect } from 'react';
// KORRIGERAD SÖKVÄG: Pekar nu på den enda, sanna provider-filen.
import { useAuth } from '@/providers/ClientProviders';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { LoginButtons } from '@/app/_components/auth/LoginButtons';

// --- Högkvalitativa underkomponenter för läsbarhet ---

const ByggPilotLogo: React.FC = () => (
  <Link href="/" className="flex items-center space-x-2.5">
    <Image 
      src="/images/byggpilotlogga1.png" 
      alt="ByggPilot Logotyp" 
      width={32} 
      height={32} 
      className="rounded-full"
      priority
    />
    <span className="text-xl font-medium text-neutral-100 hidden sm:inline-block">ByggPilot</span>
  </Link>
);

const PublicNavLinks: React.FC = () => {
  const links = ['Så fungerar det', 'Priser', 'Tips för proffs', 'Kontakt'];
  return (
    <div className="hidden md:flex items-center bg-[#1C1C1E]/80 border border-neutral-700/60 rounded-full nav-container-shadow backdrop-blur-lg px-2 py-1">
      {links.map(link => (
        <a key={link} href="#" className="text-sm font-medium text-neutral-300 px-4 py-1.5 hover:text-white hover:bg-neutral-700/50 transition-colors duration-300 rounded-full whitespace-nowrap">
          {link}
        </a>
      ))}
    </div>
  );
};

const PublicHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${scrolled ? 'bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800' : 'bg-transparent'}`}></div>
      <div className="relative mx-auto w-full max-w-screen-xl px-4 sm:px-6">
        <nav className="flex justify-between items-center h-10">
          <div className="flex-1 flex justify-start">
            <ByggPilotLogo />
          </div>
          <div className="flex-none hidden md:flex justify-center">
            <PublicNavLinks />
          </div>
          <div className="flex-1 flex justify-end">
            <LoginButtons />
          </div>
        </nav>
      </div>
    </header>
  );
};

const AuthenticatedHeader: React.FC<{ user: NonNullable<ReturnType<typeof useAuth>['user']> }> = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // AuthProvider kommer att upptäcka utloggningen och uppdatera state automatiskt.
  };

  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white border-b sticky top-0 z-40">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold sm:text-xl">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Sök projekt, kunder..."
            className="pl-10 pr-4 py-2 w-48 lg:w-72 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-3 focus:outline-none">
            <Image
              src={user.photoURL || 'https://via.placeholder.com/40'}
              alt="User avatar"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-left">{user.displayName || 'Användare'}</p>
              <p className="text-xs text-gray-500 text-left">{user.email || ''}</p>
            </div>
          </button>
          
          {menuOpen && (
             <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50" onMouseLeave={() => setMenuOpen(false)}>
                <div className="py-1">
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold">{user.displayName || 'Användare'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings size={16} /> Inställningar
                    </Link>
                    <button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={16} /> Logga ut
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


// --- Huvudkomponent: Den enda källan till sanning ---

export default function Header() {
    // Koden är nu enklare: vi får user och isLoading direkt från vår enda sanna hook.
    const { user, isLoading } = useAuth();

    // Visa ingenting alls medan vi väntar. AuthProvider visar redan "Laddar..."
    if (isLoading) {
        return null;
    }

    if (user) {
        return <AuthenticatedHeader user={user} />;
    }
    
    return <PublicHeader />;
}
