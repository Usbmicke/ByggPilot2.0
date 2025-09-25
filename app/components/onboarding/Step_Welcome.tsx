
'use client';

import React from 'react';

interface Props {
  userName: string;
  onProceed: () => void;
  onSkip: () => void;
  onShowSecurity: () => void;
}

const Step_Welcome: React.FC<Props> = ({ userName, onProceed, onSkip, onShowSecurity }) => {
  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Välkommen ombord, {userName}!</h1>
      <p className="text-gray-300 mt-4 max-w-md mx-auto">
        Jag är ByggPilot, din nya digitala kollega. Mitt jobb är att eliminera ditt papperskaos genom att automatisera administrationen direkt i ditt befintliga Google Workspace.
      </p>
      <p className="text-gray-300 mt-4 max-w-md mx-auto">
        Som ett första, kraftfullt steg för att skapa ordning och reda, vill du att jag skapar en standardiserad och ISO-inspirerad mappstruktur direkt i din Google Drive?
      </p>
      
      <div className="mt-8 space-y-4">
        <button 
          onClick={onProceed}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105"
        >
          Ja, skapa mappstruktur
        </button>
        <button 
          onClick={onSkip}
          className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Nej tack, jag gör det senare
        </button>
      </div>

      <div className="mt-6">
        <button onClick={onShowSecurity} className="text-sm text-cyan-400 hover:underline">
          Hur funkar det & hur hanteras min data?
        </button>
      </div>
    </div>
  );
};

export default Step_Welcome;
