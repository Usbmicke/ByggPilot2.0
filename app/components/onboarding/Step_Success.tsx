
'use client';

import React from 'react';

interface Props {
  onComplete: () => void;
}

const Step_Success: React.FC<Props> = ({ onComplete }) => {
  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center animate-fade-in">
      <div className="mb-6">
        <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white">Klart! Ditt digitala kontor är redo.</h2>
      <p className="text-gray-300 mt-4 max-w-md mx-auto">
        Jag har skapat din nya mappstruktur i Google Drive. Du hittar den under mappen <code className="bg-gray-700 text-cyan-300 px-2 py-1 rounded">ByggPilot - [Företagsnamn]</code>.
      </p>
      <p className="text-gray-300 mt-4 max-w-md mx-auto">
        Från och med nu kommer alla offerter, checklistor och underlag jag skapar att sparas där automatiskt, så du alltid har full koll och ordning och reda.
      </p>
      
      <div className="mt-8">
        <button 
          onClick={onComplete}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-105"
        >
          Ja, kör igång!
        </button>
      </div>
    </div>
  );
};

export default Step_Success;
