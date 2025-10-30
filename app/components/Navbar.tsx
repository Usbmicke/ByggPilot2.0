import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// FAS 0 KORRIGERING: Korrigerad importväg. Borttagning av det felaktiga '/app'-prefixet.
import LoginButtons from '@/components/auth/LoginButtons';

// GULDSTANDARD-FIX: Importerar en alternativ, förhoppningsvis okorrupt, logotypfil.
// Felet 'unable to decode image data' indikerar att den ursprungliga filen var trasig.
import logo from '@/public/images/byggpilotlogga1.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-background-secondary p-4 flex justify-between items-center z-20 border-b border-border-primary">
      {/* Logo med länk till startsidan */}
      <Link href="/" className="flex items-center">
        <div className="relative h-10 w-10 mr-2">
          <Image 
            src={logo} // Använd den importerade bilden
            alt="ByggPilot-logotypen, en blå och vit hjälm" 
            fill={true}
            sizes="50px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </Link>

      {/* Navigationslänkar */}
      <div className="hidden md:flex items-center space-x-6">
        <a href="#what-we-do" className="text-text-secondary hover:text-accent-blue transition-colors duration-200">
          Vad vi gör
        </a>
        <a href="#oss" className="text-text-secondary hover:text-accent-blue transition-colors duration-200">
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
