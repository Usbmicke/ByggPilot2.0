'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} ByggPilot. Alla rättigheter förbehållna.</p>
            <p>En del av Ditt Företag AB</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Dokumentation</a>
            <a href="#" className="hover:text-white transition-colors">Priser</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
