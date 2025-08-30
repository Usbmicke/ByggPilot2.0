'use client';

import { useAuth } from '../../providers/AuthContext';
import React from 'react';
import Image from 'next/image';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

export const Header = () => {
  const { login } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
                <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} className="h-9 w-auto"/>
                <span className="text-2xl font-bold text-white">ByggPilot</span>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={login}
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-2 px-3 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-300"
                >
                    <GoogleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Logga in med Google</span>
                    <span className="sm:hidden text-sm">Logga in</span>
                </button>
                <button 
                    onClick={login}
                    className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-cyan-600 transition-all duration-300 animate-pulse-glow"
                >
                    <span className="hidden sm:inline">Testa ByggPilot Gratis</span>
                    <span className="sm:hidden">Testa Gratis</span>
                </button>
            </nav>
        </div>
    </header>
  );
};