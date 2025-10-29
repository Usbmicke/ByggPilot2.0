
'use client';

import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';

// VÄRLDSKLASS-KORRIGERING: Definierar props korrekt
interface StepSuccessProps {
  companyName: string | null;
  folderUrl: string | null;
  onComplete: () => void; // Accepterar onComplete från föräldern
}

const Step_Success: React.FC<StepSuccessProps> = ({ companyName, folderUrl, onComplete }) => {
  const displayName = companyName || 'ditt företag';

  // VÄRLDSKLASS-KORRIGERING: Använder den mottagna onComplete-funktionen direkt
  // och tar bort den onödiga lokala implementeringen.

  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center animate-fade-in">
      
      <div className="mb-5 flex justify-center">
        <CheckCircle2 className="w-16 h-16 text-green-400" />
      </div>

      <h2 className="text-3xl font-bold text-white">Allt är klart!</h2>
      <p className="text-gray-300 mt-4 max-w-lg mx-auto">
        Din projektmapp <code className="bg-gray-700 text-cyan-300 px-2 py-1 rounded">ByggPilot - {displayName}</code> har skapats i din Google Drive.
      </p>

      {folderUrl && (
        <div className="mt-6">
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 justify-center bg-gray-700/80 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            Öppna mappen i Google Drive
          </a>
        </div>
      )}

       <p className="text-xs text-gray-500 mt-4 max-w-sm mx-auto">
          Ser du inte mappen direkt? Det kan ibland ta en minut för Google att synkronisera. Om den inte dyker upp, slutför onboardingen och fråga mig i chatten så hjälper jag dig.
       </p>

      <div className="mt-10">
        <button 
          onClick={onComplete} // VÄRLDSKLASS-KORRIGERING: Anropar prop från föräldern
          className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:bg-cyan-500 focus:ring-4 focus:ring-cyan-500/50"
        >
          Slutför & Gå till Dashboard
        </button>
      </div>
    </div>
  );
};

export default Step_Success;
