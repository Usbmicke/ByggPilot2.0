import Link from 'next/link';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-gray-400">Din partner i byggprojektledning.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Länkar</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#features" className="hover:text-blue-400">Funktioner</Link></li>
              <li><Link href="#pricing" className="hover:text-blue-400">Pris</Link></li>
              <li><Link href="#contact" className="hover:text-blue-400">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="hover:text-blue-400">Integritetspolicy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400">Användarvillkor</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} ByggPilot AB. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
