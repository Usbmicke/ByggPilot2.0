
'use client';

import React from 'react';
import Image from 'next/image';

const Step_CreateStructure: React.FC = () => {
  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center animate-fade-in">
      
      {/* Behållare för logotyp och spinner */}
      <div className="relative flex justify-center items-center mb-6 w-24 h-24 mx-auto">
        
        {/* Spinner-animation */}
        <div className="absolute inset-0 border-4 border-t-4 border-gray-600 border-t-cyan-500 rounded-full animate-spin"></div>

        {/* ByggPilot-logotyp i mitten (Återställd) */}
        <Image 
          src="/images/byggpilotlogga1.png" 
          alt="ByggPilot Logotyp" 
          width={64} // Något mindre än behållaren för att spinnaren ska synas
          height={64}
          className="object-contain"
        />
      </div>

      <h2 className="text-2xl font-bold text-white">Skapar din digitala arbetsyta...</h2>
      <p className="text-gray-400 mt-2 max-w-md mx-auto">Ett ögonblick, jag bygger en säker och organiserad mappstruktur i din Google Drive. Detta gör att jag kan hantera dina dokument automatiskt.</p>
    </div>
  );
};

export default Step_CreateStructure;
