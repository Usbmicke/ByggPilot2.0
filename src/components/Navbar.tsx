
'use client';

import Image from 'next/image';
import Link from 'next/link';
import LoginButtons from '@/components/auth/LoginButtons'; // KORRIGERAD SÖKVÄG

export const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={150} height={40} priority style={{ height: 'auto' }} />
            </Link>
          </div>
          <div className="hidden md:block">
            <LoginButtons />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
