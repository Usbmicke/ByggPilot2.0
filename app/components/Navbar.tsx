import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Importera Link
import LoginButtons from '@/app/components/auth/LoginButtons';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-80 p-4 flex justify-between items-center z-20 shadow-md">
      {/* Logo med länk till startsidan */}
      <Link href="/" className="flex items-center">
        {/* KORRIGERING: Använder "fill" för att anpassa bilden till sin container */}
        {/* Detta är den mest robusta lösningen för responsiva bilder. */}
        <div className="relative h-10 w-10 mr-2"> {/* Justerad storlek för att matcha logotypens dimensioner */}
          <Image 
            src="/byggpilot-logo.png" 
            alt="ByggPilot-logotypen, en blå och vit hjälm" 
            fill={true}
            sizes="50px" // Informerar Next.js om bildens renderade storlek
            style={{ objectFit: 'contain' }} // Säkerställer att bilden skalar korrekt
            priority // Prioritera laddning av logotypen eftersom den är synlig direkt
          />
        </div>
      </Link>

      {/* Navigationslänkar */}
      <div className="hidden md:flex items-center space-x-6">
        <a href="#what-we-do" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
          Vad vi gör
        </a>
        <a href="#oss" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
          Om Oss
        </a>
      </div>

      {/* Inloggningsknapp */}
      <div className="flex items-center">
        <LoginButtons />
      </div>
    </nav>
  );
};

export default Navbar;
