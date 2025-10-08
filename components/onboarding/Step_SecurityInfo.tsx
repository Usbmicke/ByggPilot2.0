
'use client';

import React from 'react';

interface Props {
  onProceed: () => void;
  onGoBack: () => void;
}

const Step_SecurityInfo: React.FC<Props> = ({ onProceed, onGoBack }) => {
  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-left animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-4">Säkerhet & Transparens: Dina data är dina.</h2>
      <p className="text-gray-400 mb-6">Det här är viktigt för oss att du förstår:</p>
      
      <ul className="space-y-4 text-gray-300">
        <li className="flex items-start">
          <span className="text-cyan-400 mr-3 mt-1">✓</span>
          <span><strong className="font-semibold text-white">Jag är en gäst i ditt system:</strong> ByggPilot lagrar INGA av dina projektfiler, dokument eller mail. Allt stannar säkert i ditt eget Google Drive och Google Workspace. Vi är bara den intelligenta motorn som hjälper dig organisera.</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-3 mt-1">✓</span>
          <span><strong className="font-semibold text-white">Du har full kontroll:</strong> Kopplingen till Google ger mig enbart tillåtelse att, på ditt kommando, organisera filer och hämta information åt dig. Du kan när som helst ta bort åtkomsten via dina Google-inställningar.</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-3 mt-1">✓</span>
          <span><strong className="font-semibold text-white">Standardiserad säkerhet:</strong> Vi använder Googles egen säkra inloggningsteknik (OAuth 2.0) för detta. All din data skyddas av Googles infrastruktur.</span>
        </li>
      </ul>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onProceed}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105"
        >
          Ok, jag förstår. Skapa mappstruktur!
        </button>
        <button 
          onClick={onGoBack}
          className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Jag avvaktar just nu
        </button>
      </div>
    </div>
  );
};

export default Step_SecurityInfo;
