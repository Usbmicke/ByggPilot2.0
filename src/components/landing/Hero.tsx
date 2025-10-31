import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 -mt-16">

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-100 mb-6 leading-tight">
        AI för hantverkare. <br className="hidden md:block" /> På riktigt.
      </h1>

      {/* Sub-headline */}
      <p className="max-w-2xl text-md md:text-lg text-neutral-400 mb-10">
        Du blev byggare för att bygga, inte för att drunkna i papper. ByggPilot är din proaktiva AI-kollega som automatiserar KMA, säkrar din ekonomi och stoppar de 111-miljarders byggfelen – innan de ens sker.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
         <a href="#" className="group inline-flex items-center justify-center w-full sm:w-auto bg-white text-neutral-900 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-neutral-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10">
            <span>Ta kontrollen nu (Testa Gratis 14 Dagar)</span>
         </a>
         <a href="#" className="group inline-flex items-center justify-center w-full sm:w-auto bg-transparent border border-neutral-700 text-neutral-300 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-neutral-800/50 hover:text-white hover:-translate-y-1 hover:border-neutral-600">
            <span>Se demon (2 min)</span>
         </a>
      </div>
    </section>
  );
};

export default Hero;
