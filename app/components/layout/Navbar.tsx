'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Definiera navigeringslänkar
  const navLinks = [
    { href: '/dashboard', label: 'Översikt' },
    { href: '/projects', label: 'Projekt' },
    { href: '/customers', label: 'Kunder' },
  ];

  // Om användaren inte är inloggad (t.ex. på inloggningssidan), rendera ingenting.
  // Detta förhindrar att navbaren visas på sidor där den inte ska vara.
  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              ByggPilot
            </Link>
          </div>
          
          {/* Navigationslänkar (för större skärmar) */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navLinks.map((link) => {
              // Markera länken som aktiv om den nuvarande sökvägen börjar med länkens href.
              // Exempel: /projects/123 kommer att markera /projects som aktiv.
              const isActive = pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Användarmeny och utloggning */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <p className="text-sm text-gray-600 mr-4">
              <span className="hidden md:inline">Inloggad som</span> {session.user?.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/' })} // Skicka användaren till startsidan efter utloggning
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out">
              Logga ut
            </button>
          </div>

          {/* Hamburgermeny (för små skärmar) - kan implementeras senare */}
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Ikon för hamburgermeny här */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
