import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthContext';
import Logo from './Logo';

const Header = () => {
  const { user, login } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white bg-opacity-90 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-gray-600 hover:text-blue-600">Funktioner</Link>
          <Link href="#pricing" className="text-gray-600 hover:text-blue-600">Pris</Link>
          <Link href="#contact" className="text-gray-600 hover:text-blue-600">Kontakt</Link>
        </nav>
        <div>
          {user ? (
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Gå till Dashboard
            </Link>
          ) : (
            <button 
              onClick={login} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Logga in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
