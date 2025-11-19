
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/_providers/ClientProviders';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import { SignInHandler } from '@/app/_components/auth/SignInHandler';

// =======================================================================
//  1. HEADER FÖR PUBLIK LANDNINGSSIDA (UTLOGGAD)
//     (Denna del är oförändrad, den fungerar som den ska)
// =======================================================================

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
            <SignInHandler />
          </div>
        </nav>
      </div>
    </header>
  );
};


// =======================================================================
//  2. HEADER FÖR DASHBOARD (INLOGGAD)
//     (Denna del är helt omskriven för att matcha den nya designen)
// =======================================================================

const AuthenticatedHeader: React.FC = () => {
  return (
    <header className="flex h-20 flex-shrink-0 items-center justify-between px-6 md:px-8 bg-[#1C1C1E] border-b border-neutral-800/50">
      {/* Sökfält */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Sök efter projekt, kunder, dokument..."
          className="w-full bg-[#111113] border border-neutral-700/70 rounded-lg text-neutral-200 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-neutral-500"
        />
      </div>

      {/* Notisklocka */}
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
          <Bell className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

// =======================================================================
//  3. HUVUDKOMPONENT SOM VÄLJER RÄTT HEADER
//     (Logiken är densamma, den väljer bara en ny version av AuthHeader)
// =======================================================================

export default function Header() {
    const { user, isLoading } = useAuth();

    // Visa ingenting medan vi verifierar auth-status
    if (isLoading) {
        return null;
    }

    // Om användare är inloggad, visa den nya, slimmade dashboard-headern
    if (user) {
        return <AuthenticatedHeader />;
    }
    
    // Annars, visa den publika headern för landningssidan
    return <PublicHeader />;
}
