"use client";

import React, { useState, useEffect } from 'react';
import LoginButtons from '@/components/auth/LoginButtons';
import Link from 'next/link';
import Image from 'next/image'; // Importerad

const ByggPilotLogo: React.FC = () => (
  <Link href="/" className="flex items-center space-x-2.5">
    {/* Ersatt SVG med Bild-komponent för logotypen */}
    <Image 
      src="/images/byggpilotlogga1.png" 
      alt="ByggPilot Logotyp" 
      width={24} 
      height={24} 
      className="rounded-full" // Behåller rundningen som en stil-detalj
    />
    <span className="text-xl font-medium text-neutral-100">ByggPilot</span>
  </Link>
);

const NavLinks: React.FC = () => {
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

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
       <div className={`absolute inset-0 transition-opacity duration-300 ${scrolled ? 'bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800' : 'opacity-0'}`}></div>
      <div className="relative mx-auto w-full max-w-screen-xl px-6">
        <nav className="flex justify-between items-center h-10">
          {/* Left Side */}
          <div className="flex-1 flex justify-start">
            <ByggPilotLogo />
          </div>
          
          {/* Center */}
          <div className="flex-none hidden md:flex justify-center">
            <NavLinks />
          </div>

          {/* Right Side */}
          <div className="flex-1 flex justify-end">
            <LoginButtons />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
