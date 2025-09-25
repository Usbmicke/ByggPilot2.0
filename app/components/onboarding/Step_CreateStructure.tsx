
'use client';

import React from 'react';

const Step_CreateStructure: React.FC = () => {
  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center animate-fade-in">
      <div className="flex justify-center items-center mb-6">
        {/* En enkel pulserande animation för logotypen */}
        <div className="animate-pulse">
          <svg className="w-16 h-16 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white">Perfekt! Jag bygger ditt digitala kontor...</h2>
      <p className="text-gray-400 mt-2">Ett ögonblick, jag skapar en säker och organiserad mappstruktur i din Google Drive.</p>
    </div>
  );
};

export default Step_CreateStructure;
