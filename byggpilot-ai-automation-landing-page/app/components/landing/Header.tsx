"use client";

import React, { useState, useEffect } from 'react';
import GoogleLoginButton from '../ui/GoogleLoginButton';
import Link from 'next/link';

const ByggPilotLogo: React.FC = () => (
  <Link href="/" className="flex items-center space-x-2.5">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/>
      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
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
            <GoogleLoginButton />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
