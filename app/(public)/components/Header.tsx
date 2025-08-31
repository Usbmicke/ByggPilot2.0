'use client';
import { useAuth } from '@/app/providers/AuthContext';
import Image from 'next/image';
import React from 'react';

export default function Header() {
  const { login } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-brand-dark bg-opacity-90 backdrop-blur-sm shadow-lg border-b border-brand-medium/50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
          <span className="text-2xl font-bold text-white">ByggPilot</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={login} className="hidden md:block text-brand-text font-semibold py-2 px-4 border border-brand-light rounded-lg hover:bg-brand-medium transition-colors">
            Logga in med Google
          </button>
          <button onClick={login} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30">
            Testa ByggPilot Gratis
          </button>
        </div>
      </div>
    </header>
  );
}
