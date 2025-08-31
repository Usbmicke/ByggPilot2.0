import React from 'react';

const Footer = () => (
    <footer className="border-t border-white/10 bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} ByggPilot AB. Alla rättigheter förbehållna.</p>
                <div className="mt-2">
                    <a href="#" className="hover:text-cyan-400">Integritetspolicy</a>
                    <span className="mx-2">&middot;</span>
                    <a href="#" className="hover:text-cyan-400">Användarvillkor</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
