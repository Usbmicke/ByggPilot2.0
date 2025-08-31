'use client';

import React from 'react';

const ProblemSection = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Känner du igen dig?</h2>
          <p className="text-gray-400 mt-2">Startsträckan för ett nytt projekt är ofta lång och full av hinder.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">Timmar till Dagar av Setup</h3>
            <p className="text-gray-400">Bara att sätta upp en korrekt mappstruktur, grundläggande konfiguration och kodstandarder kan ta evigheter. Dyrbar tid som kunde lagts på att bygga faktiska funktioner.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">Repetitivt Boilerplate</h3>
            <p className="text-gray-400">Hur många gånger har du skrivit samma inloggningssida, samma header, samma databasanslutning? Repetitiv kod är en källa till buggar och tristess.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">Kontextväxling & Sökande</h3>
            <p className="text-gray-400">Att ständigt behöva leta upp bästa praxis, kodexempel och dokumentation stjäl fokus från det verkliga arbetet – att lösa problem och skapa värde.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
