
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { completeOnboarding } from '@/actions/userActions'; // IMPORTERA SERVER ACTION

interface StepSuccessProps {
  companyName: string | null;
  folderUrl: string | null;
}

const Step_Success: React.FC<StepSuccessProps> = ({ companyName, folderUrl }) => {
  const router = useRouter();
  const { data: session } = useSession(); // Hämta sessionen

  const displayName = companyName || 'ditt företag';

  const handleComplete = async () => {
    if (!session?.user?.id) {
      console.error('Kunde inte slutföra onboarding: Användar-ID saknas.');
      // Hantera felet, kanske visa ett meddelande till användaren
      return;
    }

    // 1. Anropa Server Action för att uppdatera databasen
    const result = await completeOnboarding(session.user.id);

    if (result.success) {
      // 2. Omdirigera ENBART om databasen har uppdaterats korrekt
      router.push('/dashboard?tour=true');
    } else {
      console.error('Kunde inte spara onboarding-status:', result.error);
      // Visa ett felmeddelande för användaren här
    }
  };

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
          onClick={handleComplete} // Använd den nya asynkrona funktionen
          className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:bg-cyan-500 focus:ring-4 focus:ring-cyan-500/50"
        >
          Slutför & Gå till Dashboard
        </button>
      </div>
    </div>
  );
};

export default Step_Success;
