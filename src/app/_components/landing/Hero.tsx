
'use client';

import React from 'react';
import { useSignIn } from '@/app/_hooks/useSignIn';
import { FaGoogle } from 'react-icons/fa';

// =======================================================================
//  HERO-SEKTION (VERSION 2.0 - FUNKTIONELL CTA)
//  Nu en klientkomponent som använder useSignIn-hooken för att säkerställa
//  att den primära call-to-action-knappen fungerar korrekt.
// =======================================================================

const Hero: React.FC = () => {
  const { handleGoogleSignIn, isLoading, error } = useSignIn();

  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 -mt-20">

      {/* Felmeddelande */}
      {error && (
        <div className="absolute top-24 bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-100 mb-6 leading-tight animate-fade-in-down">
        AI för hantverkare. <br className="hidden md:block" /> På riktigt.
      </h1>

      {/* Sub-headline */}
      <p className="max-w-2xl text-md md:text-lg text-neutral-400 mb-10 animate-fade-in-down animation-delay-300">
        Du blev byggare för att bygga, inte för att drunkna i papper. ByggPilot är din proaktiva AI-kollega som automatiserar KMA, säkrar din ekonomi och stoppar de 111-miljarders byggfelen – innan de ens sker.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-600">
        <button 
          onClick={handleGoogleSignIn} 
          disabled={isLoading}
          className="group inline-flex items-center justify-center w-full sm:w-auto bg-white text-neutral-900 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-neutral-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <FaGoogle className="mr-3 transition-transform duration-300 group-hover:scale-110"/>
          <span>
            {isLoading ? 'Vänta...' : 'Testa Gratis med Google'}
          </span>
        </button>
        <a href="#" className="group inline-flex items-center justify-center w-full sm:w-auto bg-transparent border border-neutral-700 text-neutral-300 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-neutral-800/50 hover:text-white hover:-translate-y-1 hover:border-neutral-600">
            <span>Se demon (2 min)</span>
        </a>
      </div>
    </section>
  );
};

export default Hero;
